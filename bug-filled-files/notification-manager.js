export class NotificationManager {
    constructor(dbStorage, currentUser) {
        this.serviceWorkerRegistration = null;
        this.hasPermission = false;
        this.dbStorage = dbStorage;
        this.isRequestingPermission = false;
        this.hasBrowserPermission = false;  // New flag to track browser permission
        this.hasRequestedSoundBefore = false;
        this.checkInterval;
        this.notificationsEnabled = false;
        this.soundEnabled = false;
        this.currentUser = currentUser;
        this.permissionJustGranted = false; // Track if permission was just granted
        // New property for browser-level permission
        this.browserPermissionGranted = false;
    }

    async init() {
        // Initialize the IndexedDB
        await this.dbStorage.open();

        // Load user preferences
        await this.loadUserPreferences();

        // Check browser permission separately
        if ('Notification' in window) {
            this.browserPermissionGranted = Notification.permission === 'granted';
        }
        // Check if service workers are supported by the browser
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service worker registered: ', this.serviceWorkerRegistration);

                // Wait for the service worker to be ready
                await navigator.serviceWorker.ready;
                console.log('Service worker is ready');

                const permission = await this.checkPermission();
                this.hasPermission = permission === 'granted';
                this.hasBrowserPermission = this.hasPermission;

                // Set up periodic checking for notifications
                this.setupNotificationChecker();
                return true;
            }
            catch (error) {
                console.error("Service worker registration failed or error in init(): ", error);
                return false;
            }
        }
        else {
            console.warn('Service workers not supported');
            return false;
        }
    }

    // Load user preferences from IndexedDB
    async loadUserPreferences() {
        try {
            const preferences = await this.dbStorage.getPreferences();

            // Only set these if we actually found preferences
            if (preferences) {
                this.notificationsEnabled = preferences.notificationsEnabled || false;

                // Wrong logic
                // *** If app notifications enabled then sound of notification is also enabled, otherwise it is disabled. ---> It is not working, need to handle this. ***
                // if (this.notificationsEnabled) {
                //     this.soundEnabled = true;
                //     return;
                // }
                this.soundEnabled = preferences.soundEnabled || false;
                console.log("User preferences loaded: ", preferences);
            } else {
                console.log("No saved preferences found, using defaults");
                this.notificationsEnabled = false;
                this.soundEnabled = false;
            }
        }
        catch (error) {
            console.error("Error loading user preferences: ", error);
            this.notificationsEnabled = false;
            this.soundEnabled = false;
        }
    }

    // Save user preferences to IndexedDB
    async saveUserPreferences() {
        try {
            await this.dbStorage.savePreferences({
                notificationsEnabled: this.notificationsEnabled,
                soundEnabled: this.soundEnabled
            });

            console.log("Preferences saved:", {
                notificationsEnabled: this.notificationsEnabled,
                soundEnabled: this.soundEnabled
            });
        }
        catch (error) {
            console.error("Error saving user preferences: ", error);
        }
    }

    initUI() {
        // Get username for element selection
        const username = `${this.currentUser.username}`;
        console.log("currentUser username is ", username);

        // Handle notification toggle
        const notificationToggle = document.querySelector('.toggle-switch input[type="checkbox"]');

        if (notificationToggle) {
            // Set initial state based on preferences
            notificationToggle.checked = this.notificationsEnabled;

            // Set up event listener for the notification toggle
            this.setupNotificationToggleListener(notificationToggle);
        } else {
            console.warn("Notification toggle element not found");
        }

        // Initialize sound toggle
        const soundToggle = document.querySelector('.sound-toggle-button');
        // const soundToggle = document.getElementById(`sound-toggle-${username}`);
        if (soundToggle) {
            const soundOnIcon = soundToggle.querySelector('.sound-on');
            const soundOffIcon = soundToggle.querySelector('.sound-off');

            // Set initial state of sound Icon based on stored preferences
            this.updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon);

            // Changing the sound Icon on click
            soundToggle.addEventListener('click', async () => {
                await this.toggleSound(!this.soundEnabled);
                this.updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon);
            });
        } else {
            console.warn("Sound toggle element not found");
        }
    }

    // Helper method to update sound toggle UI
    updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon) {
        // *** Wrong logic. ***
        // if notifications are enabled then sound will play automatically for notification, so icon is also "ON"
        // if (this.notificationsEnabled) {
        //     this.soundEnabled = true;
        // }
        if (!this.soundEnabled) {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
            soundToggle.title = "Sound is disabled";
        } else {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add("hidden");
            soundToggle.title = "Sound is enabled";
        }
    }

    // Set up the notification toggle listener with the two-step process
    setupNotificationToggleListener(notificationToggle) {
        notificationToggle.addEventListener('change', async () => {
            // Always play a UI feedback sound on toggle interaction
            await this.playUIFeedbackSound();

            // Get current toggle state
            const toggleIsOn = notificationToggle.checked;

            if (toggleIsOn) {
                // User wants to enable notifications

                // Step 1: Check if we have browser permission already
                // if (!this.hasBrowserPermission) {
                //  Handle enabling notifications
                if (!this.browserPermissionGranted) {
                    // We need to request browser permission first
                    console.log("Requesting browser permission...");

                    // Disable toggle during permission request
                    notificationToggle.disabled = true;

                    try {
                        // Request browser permission
                        const permission = await this.requestBrowserPermission();

                        if (permission === 'granted') {
                            // Permission granted, but don't enable notifications yet
                            // this.hasBrowserPermission = true;
                            this.browserPermissionGranted = true;
                            // Only enable for current user
                            this.notificationsEnabled = true;
                            await this.saveUserPreferences();
                            // this.hasPermission = true;
                            // this.permissionJustGranted = true;

                            // Reload will happen once the permission is granted, so we cannot show the message via popup, or it won't show.Therefore no need of this function.

                            // // Keep toggle on, but explain the two-step process
                            // this.showPermissionGrantedMessage();

                            // Turn off the toggle - user needs to click again to enable
                            // notificationToggle.checked = false;
                            // this.notificationsEnabled = false;
                        } else {
                            // Permission denied or dismissed
                            notificationToggle.checked = false;
                            // this.notificationsEnabled = false;
                            console.log("Notification permission is dismissed.");

                            if (permission === 'denied') {
                                this.showNotificationBlockedPopup();
                                console.log("Notifications are blocked.");
                            }
                        }
                    } finally {
                        notificationToggle.disabled = false;
                    }
                } else {
                    // Browser permission already granted, enable app notifications
                    console.log("Browser permission already granted, enabling app notifications");
                    this.notificationsEnabled = true;
                    await this.saveUserPreferences();
                }
            } else {
                // User wants to disable notifications
                console.log("App notifications disabled");
                this.notificationsEnabled = false;
                await this.saveUserPreferences();
            }
        });
    }

    // Request browser permission (separate from app notification preferences)
    async requestBrowserPermission() {
        if (this.isRequestingPermission) {
            console.log("Permission request already in progress");
            return Notification.permission;
        }

        this.isRequestingPermission = true;

        try {
            const permission = await Notification.requestPermission();
            console.log(`Browser notification permission: ${permission}`);
            return permission;
        } finally {
            this.isRequestingPermission = false;
        }
    }

    //*** Function no more needed as we can't use it, because of browser default functionality of reload. ***
    // Show message explaining the two-step process
    // showPermissionGrantedMessage() {
    //     // Close notification modal if open
    //     const notificationModal = document.querySelector('.notification-modal-wrapper');
    //     if (notificationModal) {
    //         notificationModal.style.display = 'none';
    //     }

    //     // Create alert to explain next step
    //     const alertHtml = `
    //         <div class="notification-popup permission-granted">
    //             <div class="popup-content">
    //                 <h3>✅ Browser Permission Granted</h3>
    //                 <p>Browser notifications are now allowed.</p>
    //                 <p>Click the toggle again to enable notifications for this user.</p>
    //                 <button class="close-popup">Got It</button>
    //             </div>
    //         </div>
    //     `;

    //     const tempDiv = document.createElement('div');
    //     tempDiv.innerHTML = alertHtml.trim();
    //     const alertElement = tempDiv.firstElementChild;

    //     document.body.appendChild(alertElement);

    //     const closeButton = alertElement.querySelector('.close-popup');
    //     closeButton.addEventListener('click', () => {
    //         alertElement.classList.remove('show');
    //     });

    //     // Close when clicking outside
    //     alertElement.addEventListener('click', (e) => {
    //         if (e.target === alertElement) {
    //             alertElement.classList.remove('show');
    //         }
    //     });

    //     // Show the popup
    //     alertElement.classList.add('show');
    // }

    // Setup periodic checking for notifications
    setupNotificationChecker() {
        // Clear any existing interval first
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkInterval = setInterval(() => {
            this.checkForPendingNotifications();
        }, 10000);
    }

    async checkPermission() {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return 'denied';
        }

        // Add debug logging
        console.log('Current notification state:', {
            permission: Notification.permission,
            serviceWorkerActive: this.serviceWorkerRegistration?.active != null
        });

        // Make sure service worker is ready before checking permission
        if (this.serviceWorkerRegistration && !this.serviceWorkerRegistration.active) {
            await navigator.serviceWorker.ready;
        }
        return Notification.permission;
    }

    showNotificationBlockedPopup() {
        // Closing the notification center modal if popup exist
        const notificationModal = document.querySelector('.notification-modal-wrapper');

        // If notificationModal is displayed then hide it
        if (notificationModal) {
            notificationModal.style.display = 'none';
        }

        // Check if popup already exists to prevent multiple creations
        let existingPopup = document.querySelector('.notification-popup');
        if (existingPopup) {
            existingPopup.classList.add('show');
            return;
        }

        const popupHtml = `
        <div class="notification-popup">
            <div class="popup-content">
                <h3>🚫 Notifications Blocked</h3>
                <p>Notifications are currently blocked for this site. To enable:</p>
                <ol>
                    <li>Click the site information icon in your browser's address bar</li>
                    <li>Select "Allow" for notifications</li>
                </ol>
                <button class="close-popup">Got It</button>
            </div>
        </div>
    `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = popupHtml.trim();
        const popupElement = tempDiv.firstElementChild;

        document.body.appendChild(popupElement);

        const closeButton = popupElement.querySelector('.close-popup');
        closeButton.addEventListener('click', () => {
            popupElement.classList.remove('show');
        });

        // Close when clicking outside the popup
        popupElement.addEventListener('click', (e) => {
            if (e.target === popupElement) {
                popupElement.classList.remove('show');
            }
        });

        // Show the popup
        popupElement.classList.add('show');
    }

    // ########################################## We don't need schedule notification and cancel ntoification function as we are already handling it via deleteNotifications and showNotification function via servicew worker help. and we are also not storing any notification data in task class *** 

    // // Schedule a notification for a specific task
    // async scheduleNotification(task) {
    //     if (!this.hasPermission) {
    //         console.warn('No notification permission');
    //         return false;
    //     }

    //     if (!task.dueDate || !task.notificationSettings.enabled) {
    //         console.warn('Task has no due date or notifications disabled');
    //         return false;
    //     }

    //     // Generate a unique ID for this notification
    //     const notificationId = `task-${task.task_id}-${Date.now()}`;

    //     // Create notification object
    //     const notification = {
    //         id: notificationId,
    //         taskId: task.task_id,
    //         title: task.task || 'Task Reminder',
    //         body: task.description || 'Your task is due soon',
    //         timestamp: task.notificationSettings.notificationTime.getTime(),
    //         notified: false
    //     };

    //     // Add notification to database
    //     await this.dbStorage.addNotification(notification);

    //     // Update task with notification ID
    //     task.notificationSettings.notificationId = notificationId;

    //     return true;
    // }

    // // Cancel a scheduled notification
    // async cancelNotification(task) {
    //     if (!task.notificationSettings.notificationId) {
    //         return false;
    //     }

    //     // Delete notification from database
    //     await this.dbStorage.deleteNotification(task.notificationSettings.notificationId);

    //     // Update task
    //     task.notificationSettings.enabled = false;
    //     task.notificationSettings.notificationId = null;

    //     return true;
    // }

    // ####################################

    // Check for pending notifications
    async checkForPendingNotifications() {
        // Add detailed state debugging
        console.log('Checking notifications:', {
            hasPermission: this.hasPermission,
            notificationEnabled: this.notificationsEnabled,
            serviceWorker: !!this.serviceWorkerRegistration
        });

        // // Return if permission and notifications(app) not enabled
        // if (!this.hasPermission || !this.notificationsEnabled) return;

        // Only check notifications for the current user
        if (!this.browserPermissionGranted || !this.notificationsEnabled) return;
        // Get pending notifications that are due
        const pendingNotifications = await this.dbStorage.getPendingNotifications(this.currentUser.username);

        // Additional debug logging
        console.log(`Found ${pendingNotifications.length} pending notifications to display`);

        // Show pending notifications
        for (const notification of pendingNotifications) {
            console.log("Processing notification:", notification);

            let notificationTag = notification.id; // Default tag

            if (notification.isUpdated) {
                notificationTag = `${notification.id}-updated-${Date.now()}`;
            }

            const success = await this.showNotification({ ...notification, tag: notificationTag });
            // const success = await this.showNotification(notification);
            console.log(`Notification display ${success ? 'succeeded' : 'failed'}`);

            // Mark as notified in the database only if successful
            if (success) {
                notification.notified = true;
                await this.dbStorage.updateNotification(notification);
            }
        }
    }

    // Show a notification
    async showNotification(notificationData) {
        // Add detailed validation checking
        const checks = {
            serviceWorker: !!this.serviceWorkerRegistration,
            permission: await this.checkPermission() === 'granted',
            notificationsEnabled: this.notificationsEnabled
        };

        console.log('Notification checks:', checks);

        if (!checks.serviceWorker || !checks.permission || !checks.notificationsEnabled) {
            console.warn('Cannot show notification:', {
                missingServiceWorker: !checks.serviceWorker,
                missingPermission: !checks.permission,
                notificationsDisabled: !checks.notificationsEnabled
            });
            return false;
        }

        try {
            console.log("notification data inside showNotification is ", notificationData);

            const options = {
                body: `Reminder: "${notificationData.taskName}" is due on ${new Date(notificationData.dueDate).toLocaleString()}`,
                icon: 'appIconn.jpeg',
                tag: notificationData.id, // Keep the base id for the tag.
                data: {
                    taskId: notificationData.taskId
                },
                // IMPORTANT: silent should be the opposite of soundEnabled
                silent: !this.soundEnabled,
                renotify: true // Add the renotify option to update the notification.
            };

            // Modify the tag for updated notifications.
            if (notificationData.isUpdated) {
                options.tag = `${notificationData.id}-update-${Date.now()}`;
                options.priority = 'max'; // Set higher priority for updated notifications.
            }

            await this.serviceWorkerRegistration.showNotification(
                notificationData.taskName,
                options
            );
            // await this.serviceWorkerRegistration.showNotification(
            //     notificationData.taskName,
            //     {
            //         // body: notificationData.body,
            //         body: `Reminder: "${notificationData.taskName}" is due on ${new Date(notificationData.dueDate).toLocaleString()}`,
            //         icon: 'appIconn.jpeg',
            //         tag: notificationData.id,
            //         data: {
            //             taskId: notificationData.taskId
            //         },
            //         // IMPORTANT: silent should be the opposite of soundEnabled
            //         silent: !this.soundEnabled
            //     }
            // );

            // Code is not reaching here, don't know why, sound is playing before notification is displayed.
            // Play notification sound after notification is displayed
            if (this.soundEnabled) {
                await this.playNotificationSound();
            }

            // // For updating case, we need to set isUpdated to false after notification is displayed.

            // if(notificationData.isUpdated) {
            //     notificationData.isUpdated = false;
            // }
            // console.log("we are changing notificationData.isUpdated  to false after displaying notifcaiton is ", notificationData.isUpdated);

            return true;
        }
        catch (error) {
            console.error('Error showing notification:', error);
            return false;
        }

    }

    // Play UI feedback sound - always plays when toggle is clicked
    async playUIFeedbackSound() {
        try {
            console.log("Playing UI feedback sound");
            // Use a quick, simple sound for UI feedback
            const audio = new Audio('/assets/sounds/ui-feedback-sound.mp3');

            audio.addEventListener('error', (e) => {
                console.error('Audio feedback error:', e);
            });

            await audio.play();
        } catch (error) {
            console.error('UI sound play error:', error);
        }
    }

    // Play notification sound - only plays for actual notifications if enabled
    async playNotificationSound() {
        if (!this.soundEnabled) {
            console.log("Notification sound is not enabled");
            return;
        }

        try {
            console.log("Playing notification sound");
            const audio = new Audio('/assets/sounds/notify.mp3');

            audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                console.log('Audio error code:', audio.error?.code);
                console.log('Source:', audio.src);
            });

            await audio.play();
        } catch (error) {
            console.error('Notification sound play error:', error);
        }
    }

    async toggleSound(enabled) {
        this.soundEnabled = enabled;
        console.log(`Sound notifications ${enabled ? 'enabled' : 'disabled'}`);

        // Play sound whenever user interact with toggle, this sound will be same as notification toggle.
        await this.playUIFeedbackSound();
        // // If enabling sound, play a test sound
        // if (enabled) {
        //     await this.playNotificationSound();
        // }

        // Save preferences
        await this.saveUserPreferences();
        return true;
    }

    // Get all scheduled notifications (for the notification center)
    async getAllNotifications() {
        return await this.dbStorage.getAllNotifications();
    }

}
