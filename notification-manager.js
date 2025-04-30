// // import { currentUser } from "./app.js";
// // import { IndexedDBStorage } from "./indexedDB-storage.js";

// export class NotificationManager {
//     constructor(dbStorage, currentUser) {
//         this.serviceWorkerRegistration = null;
//         this.hasPermission = false;
//         this.dbStorage = dbStorage;
//         // this.dbStorage = new IndexedDBStorage();
//         this.isRequestingPermission = false;
//         this.hasRequestedSoundBefore = false;
//         // Sound need to be play after the notification is display or shown not before it.

//         // this.hasRequestedSoundAfter = false;
//         this.checkInterval;
//         this.notificationsEnabled = false;
//         this.soundEnabled = false;
//         this.currentUser = currentUser;
//     }

//     async init() {
//         // Initialize the IndexedDB
//         await this.dbStorage.open();

//         // Load user preferences
//         await this.loadUserPreferences();

//         // // Add debug logging
//         // console.log('Initial state:', {
//         //     hasPermission: this.hasPermission,
//         //     notificationsEnabled: this.notificationsEnabled,
//         //     serviceWorkerRegistration: this.serviceWorkerRegistration
//         // });


//         // Check if service workers are supported by the browser, some browsers don't support service workers.
//         if ('serviceWorker' in navigator) {
//             try {
//                 // Register service worker
//                 this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
//                 console.log('Service worker registered: ', this.serviceWorkerRegistration);

//                 // Wait for the service worker to be ready
//                 await navigator.serviceWorker.ready;
//                 console.log('Service worker is ready');


//                 const permission = await this.checkPermission();
//                 this.hasPermission = permission === 'granted';

//             // IMPORTANT: If browser permission is granted but app notifications are disabled in preferences,
//             // respect the user's preferences rather than automatically enabling
//             // if (this.hasPermission && this.notificationsEnabled === undefined) {
//             //     // Only set to true if not explicitly set before
//             //     this.notificationsEnabled = true;
//             //     await this.saveUserPreferences();
//             // }

//                 // // Intialize sound UI elements
//                 // this.initUI();

//                 // Set up periodic checking for notifications
//                 this.setupNotificationChecker();
//                 return true;
//                 // resolve(true);
//             }
//             catch (error) {
//                 console.error("Service worker registration failed or error in init(): ", error);
//                 return false;
//                 // reject(false);
//             }
//         }
//         else {
//             console.warn('Service workers not supported');
//             return false;
//             // resolve(false);
//         }
//     }

//     // Load user preferences from IndexedDB
//     async loadUserPreferences() {
//         try {
//             const preferences = await this.dbStorage.getPreferences();
//             this.notificationsEnabled = preferences.notificationEnabled || false;
//             this.soundEnabled = preferences.soundEnabled || false;
//             console.log("User preferences loaded: ", preferences);
//         }
//         catch (error) {
//             console.error("Error loading user preferences: ", error);
//             this.notificationsEnabled = false;
//             this.soundEnabled = false;
//         }
//     }

//     // Save user preferences to IndexedDB

//     async saveUserPreferences() {
//         try {
//             await this.dbStorage.savePreferences({
//                 notificationsEnabled: this.notificationsEnabled,
//                 soundEnabled: this.soundEnabled
//             });

//             console.log("Preferences saved:", {
//                 notificationsEnabled: this.notificationsEnabled,
//                 soundEnabled: this.soundEnabled
//             });

//         }
//         catch (error) {
//             console.error("Error saving user preferences: ", error);
//         }
//     }

//     initUI() {
//         // Initialize notification toggle
//         // ** Already handled, so ignoring it for now. **

//         // Initialize sound toggle

//         const username = `${this.currentUser.username}`;
//         console.log("currentUser username is ", username);

//         // Handle notificaton toggle
//         const notificationToggle =  document.querySelector('.toggle-switch input[type="checkbox"]');

//         if (notificationToggle) {
//             // Set initial state based on preferences
//             notificationToggle.checked = this.notificationsEnabled;
//         }

//         // Initialize sound toggle
//         const soundToggle = document.getElementById(`sound-toggle-${username}`);
//         if (soundToggle) {
//             const soundOnIcon = soundToggle.querySelector('.sound-on');
//             const soundOffIcon = soundToggle.querySelector('.sound-off');

//             // Set initial state of sound Icon based on stored preferences.
//             if (!this.soundEnabled) {
//                 soundOnIcon.classList.add('hidden');
//                 soundOffIcon.classList.remove('hidden');
//                 soundToggle.title = "Sound is disabled";
//             }

//             else {
//                 soundOnIcon.classList.remove('hidden');
//                 soundOffIcon.classList.add("hidden");
//                 soundToggle.title = "Sound is enabled";
//             }

//             // Changing the sound Icon on click.
//             soundToggle.addEventListener('click', async () => {
//                 // What does it mean !this.soundEnabled, does it mean if it is true/enabled then disable it and if it is disable then enable it.
//                 await this.toggleSound(!this.soundEnabled);

//                 // Updating ui based on actual preference of sound
//                 if (this.soundEnabled) {
//                     soundOnIcon.classList.remove('hidden');
//                     soundOffIcon.classList.add('hidden');
//                     soundToggle.title = "Sound notifications enabled";
//                 } else {
//                     soundOnIcon.classList.add('hidden');
//                     soundOffIcon.classList.remove('hidden');
//                     soundToggle.title = "Sound notifications disabled";
//                 }
//             });
//         }

//     }



//     // Set up periodic checking for notifications
//     setupNotificationChecker() {

//         // Clear any existing interval first
//         if (this.checkInterval) {
//             clearInterval(this.checkInterval);
//         }
//         this.checkInterval = setInterval(() => {
//             this.checkForPendingNotifications();
//         }, 3000);

//     }

//     async checkPermission() {
//         if (!('Notification' in window)) {
//             console.warn('Notifications not supported');
//             return 'denied';
//         }

//         // Add debug logging
//         console.log('Current notification state:', {
//             permission: Notification.permission,
//             serviceWorkerActive: this.serviceWorkerRegistration?.active != null
//         });

//         // Make sure service worker is ready before checking permission
//         if (this.serviceWorkerRegistration && !this.serviceWorkerRegistration.active) {
//             await navigator.serviceWorker.ready;
//         }
//         return Notification.permission;
//     }

//     // show blocked popup and it is showing at center, after closing the notification center modal.
//     // And we can't show customized popup, that's blocked by browser or user because browser can block anytime, its not on 3 attempts, sometimes it block even on 1 attempt or 2 attempts, it happened while testing.

//     showNotificationBlockedPopup() {
//         // Closing the notification center modal if popup exist.
//         const notificationModal = document.querySelector('.notification-modal-wrapper');

//         // If notificationModal is displayed then hide it.
//         if (notificationModal) {
//             notificationModal.style.display = 'none';
//         }

//         // Check if popup already exists to prevent multiple creations
//         let existingPopup = document.querySelector('.notification-popup');
//         if (existingPopup) {
//             existingPopup.classList.add('show');
//             return;
//         }

//         const popupHtml = `
//             <div class="notification-popup">
//                 <div class="popup-content">
//                     <h3>🚫 Notifications Blocked</h3>
//                     <p>Notifications are currently blocked for this site. To enable:</p>
//                     <ol>
//                         <li>Click the site information icon in your browser's address bar</li>
//                         <li>Select "Allow" for notifications</li>
//                     </ol>
//                     <button class="close-popup">Got It</button>
//                 </div>
//             </div>
//         `;

//         const tempDiv = document.createElement('div');
//         tempDiv.innerHTML = popupHtml.trim();
//         const popupElement = tempDiv.firstElementChild;

//         document.body.appendChild(popupElement);

//         const closeButton = popupElement.querySelector('.close-popup');
//         closeButton.addEventListener('click', () => {
//             // document.body.removeChild(popupElement);
//             popupElement.classList.remove('show');
//         });

//         // Close when clicking outside the popup
//         popupElement.addEventListener('click', (e) => {
//             if (e.target === popupElement) {
//                 popupElement.classList.remove('show');
//             }
//         });

//         // Show the popup
//         popupElement.classList.add('show');
//     }

//     // Code including stop multiple permission request and also prevent mutliple popups
//     // Most advance version.

//     async requestPermission() {
//         const notificationModal = document.querySelector('.notification-modal-wrapper');
//         if (!('Notification' in window)) {
//             console.warn("Notifications not supported");
//             return false;
//         }

//         try {
//             const notificationTrigger = document.querySelector('.toggle-switch input[type="checkbox"]');

//             notificationTrigger.addEventListener('change', async () => {
//                 // If notifications are blocked and a request is already in progress further action

//                 if (Notification.permission === 'denied') {

//                     if (this.isRequestingPermission) {
//                         notificationTrigger.checked = false;
//                         console.log("Permission request already handled");
//                         return;
//                     }

//                     //  ??? Is this revert the toggle needed here, and if yes then why?
//                     // Revert the toggle
//                     notificationTrigger.checked = false;

//                     // Show blocked notification popup only if not already showned
//                     this.showNotificationBlockedPopup();
//                     return;
//                 }

//                 // If already requesting permission, prevent multiple requests
//                 if (this.isRequestingPermission) {
//                     console.log("Permission request already in progress");
//                     // Revert the toggle to prevent multiple clicks
//                     notificationTrigger.checked = false;
//                     return;
//                 }

//                 //  Handle toggle to enable notifications
//                 // Tried to enable notifications (either for browser permission or for app notification.)
//                 if (notificationTrigger.checked) {
//                     // If browser already provided permission, then enable means (enable app notifications.)

//                     if (Notification.permission === 'granted') {
//                         console.log("Notifications enabled (browser permission) and now we are enabling app notificaitons.");
//                         // We are handling app notifications.
//                         // this.notificationsEnabled = true;

//                         // this.soundEnabled = true;
//                         // Enable app ntoification and store the user preference in IndexedDB
//                         // Play a test sound to utilize the user interaction

//                         // await this.playNotificationSound();

//                         // Only enable sound if it was previously enabled or it's the first time
//                         if (!this.hasRequestedSoundBefore) {
//                             this.soundEnabled = true;
//                             await this.playNotificationSound();
//                             this.hasRequestedSoundBefore = true;
//                         }
//                     }
//                     else {
//                         try {
//                             // Disable toggle during permission request
//                             notificationTrigger.disabled = true;

//                             // Set flag to preent multiple requests
//                             this.isRequestingPermission = true;

//                             const permission = await Notification.requestPermission();

//                             switch (permission) {
//                                 case 'granted':
//                                     console.log("Browser notification permission granted.");
//                                     // When we are handling browser notification permission, its not user permission for notification.
//                                     // *** Either we don't need to add the code at all, or if adding then mark it as false. ***
//                                     // this.notificationsEnabled = false;
//                                     this.hasPermission = true;
//                                     // Enable sound when notifications are granted
//                                     // or Enable sound on first permission grant
//                                     this.soundEnabled = true;
//                                     // Play a test sound to utilize the user interaction
//                                     await this.playNotificationSound();
//                                     this.hasRequestedSoundBefore = true;
//                                     break;

//                                 case 'default':
//                                     notificationTrigger.checked = false;
//                                     // this.notificationsEnabled = false;
//                                     console.log("Permission request dismissed.");
//                                     break;

//                                 case 'denied':
//                                     notificationTrigger.checked = false;
//                                     // this.notificationsEnabled = false;
//                                     console.log("Notifications are blocked");

//                                     // this.showNotificationBlockedPopup();
//                                     break;
//                             }
//                             if (notificationModal) {
//                                 // Close the notification modal whem user dismissed, allowed or block the notifications or even if notifications are automatically blocked by browser.
//                                 notificationModal.style.display = 'none';
//                             }

//                         }
//                         catch (error) {
//                             console.error("Error requesting permission ", error);
//                             notificationTrigger.checked = false;
//                             // this.notificationsEnabled = false;
//                         }
//                         finally {
//                             // Re-enable toggle
//                             notificationTrigger.disabled = false;
//                             // Reset the flag after request completes
//                             this.isRequestingPermission = false;
//                         }
//                     }
//                 }
//                 else {
//                     // Toggled to disable ntoificaitnos
//                     console.log("App Notifications disabled");
//                     this.notificationsEnabled = false;
//                     // Since notifications are disabled we don't need to do anything with sound preferences.
//                     // *** Or sound preferences are not just associated with notifications, they are also used while enable and disabling the notification toggle or sound icon. ***

//                     // this.soundEnabled = false;
//                     // Disable app notifications, but browser notifications is enabled.
//                 }   // Store the preference in IndexedDB

//                 // Store notification and sound preferences in IndexedDB
//                 // await this.storeUserPreferences(notificationTrigger.checked);
//                 await this.saveUserPreferences();
//             });

//             // Initial permission check
//             const initialPermission = Notification.permission;
//             this.hasPermission = initialPermission === 'granted';
//             return this.hasPermission;
//         }

//         catch (error) {
//             console.error("Error requesting notification permission: ", error);

//         }
//         return false;
//     }

//     // Method to store user preferences in indexedDB ( we changed the function.)
//     // async storeUserPreferences(notificationEnabled) {
//     //     try {
//     //         // Store both notification and sound preferences
//     //         await this.dbStorage.addPreference({
//     //             notificationsEnabled: this.notificationsEnabled,
//     //             soundEnabled: this.soundEnabled
//     //         });
//     //         console.log("User preferences stored in IndexedDB");
//     //     } catch (error) {
//     //         console.error("Error storing user preferences:", error);
//     //     }        
//     // }



//     // Schedule a notification for a specific task
//     async scheduleNotification(task) {
//         if (!this.hasPermission) {
//             console.warn('No notification permission');
//             return false;
//         }

//         if (!task.dueDate || !task.notificationSettings.enabled) {
//             console.warn('Task has no due date or notifications disabled');
//             return false;
//         }

//         // Generate a unique ID for this notification
//         const notificationId = `task-${task.task_id}-${Date.now()}`;

//         // Create notification object
//         const notification = {
//             id: notificationId,
//             taskId: task.task_id,
//             title: task.task || 'Task Reminder',
//             body: task.description || 'Your task is due soon',
//             timestamp: task.notificationSettings.notificationTime.getTime(),
//             notified: false
//         };

//         // Add notification to database
//         await this.dbStorage.addNotification(notification);

//         // Update task with notification ID
//         task.notificationSettings.notificationId = notificationId;

//         return true;
//     }

//     // Cancel a scheduled notification
//     async cancelNotification(task) {
//         if (!task.notificationSettings.notificationId) {
//             return false;
//         }

//         // Delete notification from database
//         await this.dbStorage.deleteNotification(task.notificationSettings.notificationId);

//         // Update task
//         task.notificationSettings.enabled = false;
//         task.notificationSettings.notificationId = null;

//         return true;
//     }

//     // Check for pending notifications
//     async checkForPendingNotifications() {
//         // Add state debugging
//         console.log('Checking notifications:', {
//             hasPermission: this.hasPermission,
//             notificationEnabled: this.notificationsEnabled,
//             serviceWorker: !!this.serviceWorkerRegistration
//         });

//         // Return if permsision and notifications(app) not enabled.
//         if (!this.hasPermission || !this.notificationsEnabled) return;

//         // Get pending notifications that are due
//         const pendingNotifications = await this.dbStorage.getPendingNotifications();

//         // Show pending notifications
//         for (const notification of pendingNotifications) {
//             await this.showNotification(notification);

//             // Mark as notified in the database
//             notification.notified = true;
//             await this.dbStorage.updateNotification(notification);
//         }
//     }

//     // Show a notification
//     async showNotification(notificationData) {
//         // if (!this.serviceWorkerRegistration || !this.hasPermission || !this.notificationsEnabled) {
//         //     console.warn('Cannot show notification: service worker not registered or notifications disabled');
//         //     return false;
//         // }

//         // Add detailed validation checking
//         const checks = {
//             serviceWorker: !!this.serviceWorkerRegistration,
//             permission: await this.checkPermission() === 'granted',
//             notificationsEnabled: this.notificationsEnabled
//         };

//         console.log('Notification checks:', checks);

//         if (!checks.serviceWorker || !checks.permission || !checks.notificationsEnabled) {
//             console.warn('Cannot show notification:', {
//                 missingServiceWorker: !checks.serviceWorker,
//                 missingPermission: !checks.permission,
//                 notificationsDisabled: !checks.notificationsEnabled
//             });
//             return false;
//         }

//         // if (!this.serviceWorkerRegistration) {
//         //     console.warn('Service worker not registered');
//         //     return false;
//         // }

//         try {

//             await this.serviceWorkerRegistration.showNotification(
//                 notificationData.title,
//                 {
//                     body: notificationData.body,
//                     icon: 'appIconn.jpeg',
//                     //   icon: 'C:\Users\Lenovo\Desktop\coding stuff\javascript_projects\todo-list-app\applogo.jpg', 
//                     tag: notificationData.id,
//                     data: {
//                         taskId: notificationData.taskId
//                     },
//                     // silent: false
//                     // IMPORTANT: silent should be the opposite of soundEnabled
//                     silent: !this.soundEnabled
//                 }
//             );
//             // this.playNotificationSound();

//             // Play notification sound after notification is displayed or shown.
//             if (this.soundEnabled) {
//                 await this.playNotificationSound();
//             }

//             return true;
//         }
//         catch (error) {
//             console.error('Error showing notification:', error);
//             return false;
//         }
//     }

//     // Play notification sound
//     async playNotificationSound() {
//         if (!this.soundEnabled) {
//             console.log("sound is not enabled.");
//             return;
//         }

//         try {
//             console.log("sound is enabled, playing notification sound.");
//             // Use absolute path from root of your web app
//             const audio = new Audio('/assets/sounds/notify.mp3');
//             // const audio = new Audio('C:\Users\Lenovo\Desktop\coding stuff\javascript_projects\todo-list-app\assets\sounds\notify.mp3');

//             // Add event listeners for debugging
//             audio.addEventListener('error', (e) => {
//                 console.error('Audio error:', e);
//                 console.log('Audio error code:', audio.error.code);
//                 console.log('Source:', audio.src);
//             });

//             await audio.play();
//         } catch (error) {
//             console.error('Sound play error:', error);
//             // Don't disable sound on first error
//             // this.soundEnabled = false;
//         }
//     }
//     // async playNotificationSound() {
//     //     if (!this.soundEnabled) {
//     //         return;
//     //     }

//     //     try {
//     //         const audio = new Audio('notify.mp3');
//     //         await audio.play();
//     //     }
//     //     // audio.play().catch(error => console.error('Error playing sound:', error));
//     //     catch (error) {
//     //         console.log('Sound play prevented: ', error);
//     //         // Disable sound if it fails
//     //         this.soundEnabled = false;
//     //     }
//     // }

//     async toggleSound(enabled) {
//         this.soundEnabled = enabled;
//         console.log(`Sound notifications ${enabled ? 'enabled' : 'disabled'}`);

//         // If enabling sound, play a test sound
//         if (enabled) {
//             await this.playNotificationSound();
//         }
//         // Save preferences
//         await this.saveUserPreferences();
//         return true;

//     }

//     // Get all scheduled notifications (for the notification center)
//     async getAllNotifications() {
//         return await this.dbStorage.getAllNotifications();
//     }

// }

// ################################################################

// export class NotificationManager {
//     constructor(dbStorage, currentUser) {
//         this.serviceWorkerRegistration = null;
//         this.hasPermission = false;
//         this.dbStorage = dbStorage;
//         this.isRequestingPermission = false;
//         this.hasBrowserPermission = false;  // New flag to track browser permission
//         this.hasRequestedSoundBefore = false;
//         this.checkInterval;
//         this.notificationsEnabled = false;
//         this.soundEnabled = false;
//         this.currentUser = currentUser;
//         this.permissionJustGranted = false; // Track if permission was just granted

//         // ... Added later on...
//         // Add a flag to track global browser permission separatley
//         this.browserNotificationPermission = 'default';

//         // Add a flat to track if we're currently processing toggles
//         this.isProcessingToggle = false;
//         this.lastSoundPlayTime = 0;
//     }

//     async init() {
//         // Initialize the IndexedDB
//         await this.dbStorage.open();

//         // Check the browser's GlOBAL permission state first

//         if ('Notification' in window) {
//             this.browserNotificationPermission = Notification.permission;
//             console.log("Browser notification permission: ", this.browserNotificationPermission);
//         }

//         console.log("Current user during init is ", this.currentUser);
//         // Load user preferences
//         await this.loadUserPreferences();

//         // Check if service workers are supported by the browser
//         if ('serviceWorker' in navigator) {
//             try {
//                 // Register service worker
//                 this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
//                 console.log('Service worker registered: ', this.serviceWorkerRegistration);

//                 // Wait for the service worker to be ready
//                 await navigator.serviceWorker.ready;
//                 console.log('Service worker is ready');

//                 const permission = await this.checkPermission();
//                 this.hasPermission = permission === 'granted';
//                 this.hasBrowserPermission = this.hasPermission;

//                 // Set up periodic checking for notifications
//                 this.setupNotificationChecker();
//                 return true;
//             }
//             catch (error) {
//                 console.error("Service worker registration failed or error in init(): ", error);
//                 return false;
//             }
//         }
//         else {
//             console.warn('Service workers not supported');
//             return false;
//         }
//     }

//     // Load user preferences from IndexedDB
//     async loadUserPreferences() {
//         try {
//             console.log(`Loading preferences for user: ${this.currentUser.username}`);
//             const preferences = await this.dbStorage.getPreferences();

//             // Only set these if we actually found preferences
//             if (preferences) {
//                 this.notificationsEnabled = preferences.notificationsEnabled || false;

//                 // Wrong logic
//                 // *** If app notifications enabled then sound of notification is also enabled, otherwise it is disabled. ---> It is not working, need to handle this. ***
//                 // if (this.notificationsEnabled) {
//                 //     this.soundEnabled = true;
//                 //     return;
//                 // }
//                 this.soundEnabled = preferences.soundEnabled || false;
//                 // console.log("User preferences loaded: ", preferences);
//                 console.log(`Loaded preferences for ${this.currentUser.username}:`, {
//                     notificationsEnabled: this.notificationsEnabled,
//                     soundEnabled: this.soundEnabled
//                 });
//             } else {
//                 this.notificationsEnabled = false;
//                 this.soundEnabled = false;
//                 console.log("No saved preferences found, using defaults");

//             }
//         }
//         catch (error) {
//             console.error("Error loading user preferences: ", error);
//             this.notificationsEnabled = false;
//             this.soundEnabled = false;
//         }
//     }

//     // Save user preferences to IndexedDB
//     async saveUserPreferences() {
//         try {
//             await this.dbStorage.savePreferences({
//                 notificationsEnabled: this.notificationsEnabled,
//                 soundEnabled: this.soundEnabled
//             });

//             console.log("Preferences saved:", {
//                 notificationsEnabled: this.notificationsEnabled,
//                 soundEnabled: this.soundEnabled
//             });
//         }
//         catch (error) {
//             console.error("Error saving user preferences: ", error);
//         }
//     }

//     initUI() {
//         // Get username for element selection -- No more needed.

//         // const username = `${this.currentUser.username}`;
//         // console.log("Setting up UI for user:", username);

//         console.log(`Initializing UI for user: ${this.currentUser.username}`);
//         console.log(`Current state: Sound=${this.soundEnabled}, Notifications=${this.notificationsEnabled}`);

//         // Handle notification toggle
//         const notificationToggle = document.querySelector('.toggle-switch input[type="checkbox"]');

//         if (notificationToggle) {
//             // Set initial state based on preferences
//             notificationToggle.checked = this.notificationsEnabled;

//             // Set up event listener for the notification toggle
//             this.setupNotificationToggleListener(notificationToggle);
//         } else {
//             console.warn("Notification toggle element not found");
//         }

//         // Initialize sound toggle
//         const soundToggle = document.querySelector('.sound-toggle-button');
//         // const soundToggle = document.getElementById(`sound-toggle-${username}`);
//         if (soundToggle) {
//             const soundOnIcon = soundToggle.querySelector('.sound-on');
//             const soundOffIcon = soundToggle.querySelector('.sound-off');

//             // Set initial state of sound Icon based on stored preferences
//             // It will make sure UI reflects the actual state from database.
//             this.updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon);

//             // // Add a state to prevent rapid clicking issues ( Now made this variable global, so don't need to define it like this.)
//             // let isProcessingToggle = false;

//             // Changing the sound Icon on click
//             soundToggle.addEventListener('click', async () => {
//                 if (this.isProcessingToggle) return; // Prevent multiple clicks
//                 this.isProcessingToggle = true;

//                 try {
//                     // Toggle sound state for current user
//                     const newSoundState = !this.soundEnabled;
//                     console.log(`Changing sound state for ${this.currentUser.username} to: ${newSoundState}`);

//                     // Update instance property
//                     this.soundEnabled = newSoundState;

//                     // Update UI immediately
//                     this.updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon);

//                     // Save to database
//                     await this.saveUserPreferences();

//                     // Play UI feedback sound ONLY if sound is now enabled
//                     if (this.soundEnabled) {
//                         await this.playNotificationSound();
//                     }
//                     console.log(`Sound preference saved for ${this.currentUser.username}: ${this.soundEnabled}`);

//                 }
//                 catch (error) {
//                     console.error(`Error toggling sound for ${this.currentUser.username}:`, error);

//                     // console.error("Error toggling sound:", error);
//                     // // Revert UI if there was an error
//                     // this.soundEnabled = !this.soundEnabled;
//                     // this.updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon);
//                 }
//                 finally {
//                     this.isProcessingToggle = false;
//                 }
//                 // await this.toggleSound(!this.soundEnabled);
//                 // this.updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon);
//             });
//         }
//         // **** This else block code doesn't make any sense, since this function will get only if soundToggle exist.
//         //  else {
//         //     console.warn("Sound toggle element not found");
//         // }
//     }

//     // Helper method to update sound toggle UI
//     updateSoundToggleUI(soundToggle, soundOnIcon, soundOffIcon) {
//         // *** Wrong logic. ***
//         // if notifications are enabled then sound will play automatically for notification, so icon is also "ON"
//         // if (this.notificationsEnabled) {
//         //     this.soundEnabled = true;
//         // }


//         if (!this.soundEnabled) {
//             soundOnIcon.classList.add('hidden');
//             soundOffIcon.classList.remove('hidden');
//             soundToggle.title = "Sound is disabled";
//         } else {
//             soundOnIcon.classList.remove('hidden');
//             soundOffIcon.classList.add("hidden");
//             soundToggle.title = "Sound is enabled";
//         }
//     }

//     // Set up the notification toggle listener with the two-step process
//     // setupNotificationToggleListener(notificationToggle) {

//     // notificationToggle.addEventListener('change', async () => {
//     //     // Always play a UI feedback sound on toggle interaction
//     //     await this.playUIFeedbackSound();

//     //     // Get current toggle state
//     //     const toggleIsOn = notificationToggle.checked;

//     //     if (toggleIsOn) {
//     //         // User wants to enable notifications

//     //         // Step 1: Check if we have browser permission already
//     //         if (!this.hasBrowserPermission) {
//     //             // We need to request browser permission first
//     //             console.log("Requesting browser permission...");

//     //             // Disable toggle during permission request
//     //             notificationToggle.disabled = true;

//     //             try {
//     //                 // Request browser permission
//     //                 const permission = await this.requestBrowserPermission();

//     //                 if (permission === 'granted') {
//     //                     // Permission granted, but don't enable notifications yet
//     //                     this.hasBrowserPermission = true;
//     //                     this.hasPermission = true;
//     //                     this.permissionJustGranted = true;

//     //                     // Reload will happen once the permission is granted, so we cannot show the message via popup, or it won't show.Therefore no need of this function.

//     //                     // // Keep toggle on, but explain the two-step process
//     //                     // this.showPermissionGrantedMessage();

//     //                     // Turn off the toggle - user needs to click again to enable
//     //                     notificationToggle.checked = false;
//     //                     this.notificationsEnabled = false;
//     //                 } else {
//     //                     // Permission denied or dismissed
//     //                     notificationToggle.checked = false;
//     //                     this.notificationsEnabled = false;
//     //                     console.log("Notification permission is dismissed.");

//     //                     if (permission === 'denied') {
//     //                         this.showNotificationBlockedPopup();
//     //                         console.log("Notifications are blocked.");
//     //                     }
//     //                 }
//     //             } finally {
//     //                 notificationToggle.disabled = false;
//     //             }
//     //         } else {
//     //             // Browser permission already granted, enable app notifications
//     //             console.log("Browser permission already granted, enabling app notifications");
//     //             this.notificationsEnabled = true;
//     //             await this.saveUserPreferences();
//     //         }
//     //     } else {
//     //         // User wants to disable notifications
//     //         console.log("App notifications disabled");
//     //         this.notificationsEnabled = false;
//     //         await this.saveUserPreferences();
//     //     }
//     // });


//     // }

//     // setupNotificationToggleListener(notificationToggle) {

//     //     notificationToggle.addEventListener('change', async () => {
//     //         if (this.isProcessingToggle) return;
//     //         this.isProcessingToggle = true;

//     //         try {
//     //             const toggleIsOn = notificationToggle.checked;

//     //             // Play sound ONLY if sound is already enabled
//     //             if (this.soundEnabled) {
//     //                 await this.playUIFeedbackSound();
//     //             }

//     //             if (toggleIsOn) {
//     //                 if (!this.hasBrowserPermission) {
//     //                     console.log("Requesting browser permission...");
//     //                     notificationToggle.disabled = true;

//     //                     try {
//     //                         const permission = await this.requestBrowserPermission();

//     //                         if (permission === 'granted') {
//     //                             this.hasBrowserPermission = true;
//     //                             this.hasPermission = true;
//     //                             this.permissionJustGranted = true;
//     //                             this.notificationsEnabled = true; // CHANGE: Enable if permission granted
//     //                             notificationToggle.checked = true; // CHANGE: Keep the toggle ON
//     //                         } else {
//     //                             notificationToggle.checked = false;
//     //                             this.notificationsEnabled = false;
//     //                             console.log("Notification permission is dismissed.");

//     //                             if (permission === 'denied') {
//     //                                 this.showNotificationBlockedPopup();
//     //                                 console.log("Notifications are blocked.");
//     //                             }
//     //                         }
//     //                     } finally {
//     //                         notificationToggle.disabled = false;
//     //                     }
//     //                 } else {
//     //                     console.log("Browser permission already granted, enabling app notifications");
//     //                     this.notificationsEnabled = true;
//     //                 }
//     //             } else {
//     //                 console.log("App notifications disabled");
//     //                 this.notificationsEnabled = false;
//     //             }

//     //             // Save preferences AFTER all changes
//     //             await this.saveUserPreferences();
//     //             console.log(`Notification preference saved: ${this.notificationsEnabled ? 'ON' : 'OFF'} for user ${this.currentUser.username}`);
//     //         } finally {
//     //             this.isProcessingToggle = false;
//     //         }
//     //     });
//     // }

//     setupNotificationToggleListener(notificationToggle) {
//         notificationToggle.addEventListener('change', async () => {
//             // Prevent rapid toggling
//             if (this.isProcessingToggle) return;
//             this.isProcessingToggle = true;

//             try {
//                 const toggleIsOn = notificationToggle.checked;
//                 console.log(`Notification toggle changed to: ${toggleIsOn} for ${this.currentUser.username}`);

//                 // Play feedback sound if sound is enabled
//                 if (this.soundEnabled) {
//                     await this.playUIFeedbackSound();
//                 }

//                 if (toggleIsOn) {
//                     // Check if we need to request browser permission
//                     if (this.browserNotificationPermission !== 'granted') {
//                         console.log("Requesting browser notification permission...");
//                         notificationToggle.disabled = true;

//                         try {
//                             const permission = await this.requestBrowserPermission();
//                             this.browserNotificationPermission = permission;

//                             if (permission === 'granted') {
//                                 console.log("Browser permission granted");
//                                 this.notificationsEnabled = true;
//                                 notificationToggle.checked = true;
//                             } else {
//                                 console.log(`Browser permission not granted: ${permission}`);
//                                 this.notificationsEnabled = false;
//                                 notificationToggle.checked = false;

//                                 if (permission === 'denied') {
//                                     this.showNotificationBlockedPopup();
//                                 }
//                             }
//                         } finally {
//                             notificationToggle.disabled = false;
//                         }
//                     } else {
//                         // Browser permission already granted
//                         console.log("Browser permission already granted, updating app setting");
//                         this.notificationsEnabled = true;
//                     }
//                 } else {
//                     // User is turning notifications off
//                     console.log("User disabled app notifications");
//                     this.notificationsEnabled = false;
//                 }

//                 // Save the updated preference
//                 await this.saveUserPreferences();
//                 console.log(`Notification preference saved for ${this.currentUser.username}: ${this.notificationsEnabled}`);
//             } catch (error) {
//                 console.error(`Error handling notification toggle for ${this.currentUser.username}:`, error);
//             } finally {
//                 this.isProcessingToggle = false;
//             }
//         });
//     }

//     // Request browser permission (separate from app notification preferences)
//     async requestBrowserPermission() {
//         if (this.isRequestingPermission) {
//             console.log("Permission request already in progress");
//             return Notification.permission;
//         }

//         this.isRequestingPermission = true;

//         try {
//             const permission = await Notification.requestPermission();
//             console.log(`Browser notification permission: ${permission}`);
//             return permission;
//         } finally {
//             this.isRequestingPermission = false;
//         }
//     }

//     //*** Function no more needed as we can't use it, because of browser default functionality of reload. ***
//     // Show message explaining the two-step process
//     // showPermissionGrantedMessage() {
//     //     // Close notification modal if open
//     //     const notificationModal = document.querySelector('.notification-modal-wrapper');
//     //     if (notificationModal) {
//     //         notificationModal.style.display = 'none';
//     //     }

//     //     // Create alert to explain next step
//     //     const alertHtml = `
//     //         <div class="notification-popup permission-granted">
//     //             <div class="popup-content">
//     //                 <h3>✅ Browser Permission Granted</h3>
//     //                 <p>Browser notifications are now allowed.</p>
//     //                 <p>Click the toggle again to enable notifications for this user.</p>
//     //                 <button class="close-popup">Got It</button>
//     //             </div>
//     //         </div>
//     //     `;

//     //     const tempDiv = document.createElement('div');
//     //     tempDiv.innerHTML = alertHtml.trim();
//     //     const alertElement = tempDiv.firstElementChild;

//     //     document.body.appendChild(alertElement);

//     //     const closeButton = alertElement.querySelector('.close-popup');
//     //     closeButton.addEventListener('click', () => {
//     //         alertElement.classList.remove('show');
//     //     });

//     //     // Close when clicking outside
//     //     alertElement.addEventListener('click', (e) => {
//     //         if (e.target === alertElement) {
//     //             alertElement.classList.remove('show');
//     //         }
//     //     });

//     //     // Show the popup
//     //     alertElement.classList.add('show');
//     // }

//     // Setup periodic checking for notifications
//     setupNotificationChecker() {
//         // Clear any existing interval first
//         if (this.checkInterval) {
//             clearInterval(this.checkInterval);
//         }

//         this.checkInterval = setInterval(() => {
//             this.checkForPendingNotifications();
//         }, 10000);
//     }

//     async checkPermission() {
//         if (!('Notification' in window)) {
//             console.warn('Notifications not supported');
//             return 'denied';
//         }

//         // Add debug logging
//         console.log('Current notification state:', {
//             permission: Notification.permission,
//             serviceWorkerActive: this.serviceWorkerRegistration?.active != null
//         });

//         // Make sure service worker is ready before checking permission
//         if (this.serviceWorkerRegistration && !this.serviceWorkerRegistration.active) {
//             await navigator.serviceWorker.ready;
//         }
//         return Notification.permission;
//     }

//     showNotificationBlockedPopup() {
//         // Closing the notification center modal if popup exist
//         const notificationModal = document.querySelector('.notification-modal-wrapper');

//         // If notificationModal is displayed then hide it
//         if (notificationModal) {
//             notificationModal.style.display = 'none';
//         }

//         // Check if popup already exists to prevent multiple creations
//         let existingPopup = document.querySelector('.notification-popup');
//         if (existingPopup) {
//             existingPopup.classList.add('show');
//             return;
//         }

//         const popupHtml = `
//             <div class="notification-popup">
//                 <div class="popup-content">
//                     <h3>🚫 Notifications Blocked</h3>
//                     <p>Notifications are currently blocked for this site. To enable:</p>
//                     <ol>
//                         <li>Click the site information icon in your browser's address bar</li>
//                         <li>Select "Allow" for notifications</li>
//                     </ol>
//                     <button class="close-popup">Got It</button>
//                 </div>
//             </div>
//         `;

//         const tempDiv = document.createElement('div');
//         tempDiv.innerHTML = popupHtml.trim();
//         const popupElement = tempDiv.firstElementChild;

//         document.body.appendChild(popupElement);

//         const closeButton = popupElement.querySelector('.close-popup');
//         closeButton.addEventListener('click', () => {
//             popupElement.classList.remove('show');
//         });

//         // Close when clicking outside the popup
//         popupElement.addEventListener('click', (e) => {
//             if (e.target === popupElement) {
//                 popupElement.classList.remove('show');
//             }
//         });

//         // Show the popup
//         popupElement.classList.add('show');
//     }

//     // ########################################## We don't need schedule notification and cancel ntoification function as we are already handling it via deleteNotifications and showNotification function via servicew worker help. and we are also not storing any notification data in task class *** 

//     // // Schedule a notification for a specific task
//     // async scheduleNotification(task) {
//     //     if (!this.hasPermission) {
//     //         console.warn('No notification permission');
//     //         return false;
//     //     }

//     //     if (!task.dueDate || !task.notificationSettings.enabled) {
//     //         console.warn('Task has no due date or notifications disabled');
//     //         return false;
//     //     }

//     //     // Generate a unique ID for this notification
//     //     const notificationId = `task-${task.task_id}-${Date.now()}`;

//     //     // Create notification object
//     //     const notification = {
//     //         id: notificationId,
//     //         taskId: task.task_id,
//     //         title: task.task || 'Task Reminder',
//     //         body: task.description || 'Your task is due soon',
//     //         timestamp: task.notificationSettings.notificationTime.getTime(),
//     //         notified: false
//     //     };

//     //     // Add notification to database
//     //     await this.dbStorage.addNotification(notification);

//     //     // Update task with notification ID
//     //     task.notificationSettings.notificationId = notificationId;

//     //     return true;
//     // }

//     // // Cancel a scheduled notification
//     // async cancelNotification(task) {
//     //     if (!task.notificationSettings.notificationId) {
//     //         return false;
//     //     }

//     //     // Delete notification from database
//     //     await this.dbStorage.deleteNotification(task.notificationSettings.notificationId);

//     //     // Update task
//     //     task.notificationSettings.enabled = false;
//     //     task.notificationSettings.notificationId = null;

//     //     return true;
//     // }

//     // ####################################

//     // Check for pending notifications
//     async checkForPendingNotifications() {
//         // Add detailed state debugging
//         console.log('Checking notifications:', {
//             hasPermission: this.hasPermission,
//             notificationEnabled: this.notificationsEnabled,
//             serviceWorker: !!this.serviceWorkerRegistration
//         });

//         // Return if permission and notifications(app) not enabled
//         if (!this.hasPermission || !this.notificationsEnabled) return;

//         // Get pending notifications that are due
//         const pendingNotifications = await this.dbStorage.getPendingNotifications();

//         // Additional debug logging
//         console.log(`Found ${pendingNotifications.length} pending notifications to display`);

//         // Show pending notifications
//         for (const notification of pendingNotifications) {
//             console.log("Processing notification:", notification);

//             let notificationTag = notification.id; // Default tag

//             if (notification.isUpdated) {
//                 notificationTag = `${notification.id}-updated-${Date.now()}`;
//             }

//             const success = await this.showNotification({ ...notification, tag: notificationTag });
//             // const success = await this.showNotification(notification);
//             console.log(`Notification display ${success ? 'succeeded' : 'failed'}`);

//             // Mark as notified in the database only if successful
//             if (success) {
//                 notification.notified = true;
//                 await this.dbStorage.updateNotification(notification);
//             }
//         }
//     }

//     // Show a notification
//     async showNotification(notificationData) {

//         // Remove this console logs later on, after testing is done.
//         // Add detailed validation checking
//         const checks = {
//             serviceWorker: !!this.serviceWorkerRegistration,
//             permission: await this.checkPermission() === 'granted',
//             notificationsEnabled: this.notificationsEnabled
//         };

//         console.log('Notification checks:', checks);

//         if (!checks.serviceWorker || !checks.permission || !checks.notificationsEnabled) {
//             console.warn('Cannot show notification:', {
//                 missingServiceWorker: !checks.serviceWorker,
//                 missingPermission: !checks.permission,
//                 notificationsDisabled: !checks.notificationsEnabled
//             });
//             return false;
//         }

//         // Check if notification conditions are met
//         if (this.browserNotificationPermission !== 'granted' || !this.notificationsEnabled) {
//             console.log(`Cannot show notification: Permission=${this.browserNotificationPermission}, Enabled=${this.notificationsEnabled}`);
//             return false;
//         }

//         try {
//             console.log("notification data inside showNotification is ", notificationData);

//             const options = {
//                 body: `Reminder: "${notificationData.taskName}" is due on ${new Date(notificationData.dueDate).toLocaleString()}`,
//                 icon: 'appIconn.jpeg',
//                 tag: notificationData.id, // Keep the base id for the tag.
//                 data: {
//                     taskId: notificationData.taskId
//                 },
//                 // Use silent based on user's sound preference
//                 silent: !this.soundEnabled,
//                 renotify: true // Add the renotify option to update the notification.
//             };

//             // Modify the tag for updated notifications.
//             if (notificationData.isUpdated) {
//                 options.tag = `${notificationData.id}-update-${Date.now()}`;
//                 options.priority = 'max'; // Set higher priority for updated notifications.
//             }

//             await this.serviceWorkerRegistration.showNotification(
//                 notificationData.taskName,
//                 options
//             );
//             // await this.serviceWorkerRegistration.showNotification(
//             //     notificationData.taskName,
//             //     {
//             //         // body: notificationData.body,
//             //         body: `Reminder: "${notificationData.taskName}" is due on ${new Date(notificationData.dueDate).toLocaleString()}`,
//             //         icon: 'appIconn.jpeg',
//             //         tag: notificationData.id,
//             //         data: {
//             //             taskId: notificationData.taskId
//             //         },
//             //         // IMPORTANT: silent should be the opposite of soundEnabled
//             //         silent: !this.soundEnabled
//             //     }
//             // );

//             // Code is not reaching here, don't know why, sound is playing before notification is displayed.
//             // Play notification sound after notification is displayed
//             if (this.soundEnabled) {
//                 await this.playNotificationSound();
//             }

//             // // For updating case, we need to set isUpdated to false after notification is displayed.

//             // if(notificationData.isUpdated) {
//             //     notificationData.isUpdated = false;
//             // }
//             // console.log("we are changing notificationData.isUpdated  to false after displaying notifcaiton is ", notificationData.isUpdated);

//             return true;
//         }
//         catch (error) {
//             console.error('Error showing notification:', error);
//             return false;
//         }

//     }

//     // Play UI feedback sound - always plays when toggle is clicked
//     async playUIFeedbackSound() {

//         // if (!this.soundEnabled) {
//         //     console.log("UI feedback sound skipped (sound disabled)");
//         //     return;
//         // }

//         const now = Date.now();
//         const minTimeBetweenSounds = 300; // 300ms

//         if (!this.soundEnabled || now - this.lastSoundPlayTime < minTimeBetweenSounds) {
//             return;
//         }

//         this.lastSoundPlayTime = now;

//         try {
//             console.log("Playing UI feedback sound");
//             // Use a quick, simple sound for UI feedback
//             const audio = new Audio('/assets/sounds/ui-feedback-sound.mp3');

//             audio.addEventListener('error', (e) => {
//                 console.error('Audio feedback error:', e);
//             });

//             await audio.play();
//         } catch (error) {
//             console.error('UI sound play error:', error);
//         }
//     }

//     // Play notification sound - only plays for actual notifications if enabled
//     async playNotificationSound() {
//         if (!this.soundEnabled) {
//             console.log("Notification sound skipped (sound disabled)");
//             return;
//         }

//         try {
//             console.log(`Playing notification sound for ${this.currentUser.username}`);
//             const audio = new Audio('/assets/sounds/notify.mp3');
//             audio.volume = 1.0;

//             audio.addEventListener('error', (e) => {
//                 console.error('Audio error:', e);
//                 console.log('Audio error code:', audio.error?.code);
//                 console.log('Source:', audio.src);
//             });

//             await audio.play();
//         } catch (error) {
//             console.error('Notification sound play error:', error);
//         }
//     }

//     async toggleSound(enabled) {
//         this.soundEnabled = enabled;
//         console.log(`Sound notifications ${enabled ? 'enabled' : 'disabled'}`);

//         // In toggling the sound UI, we won't play the sound
//         // // Play sound whenever user interact with toggle, this sound will be same as notification toggle.
//         // await this.playUIFeedbackSound();


//         // // If enabling sound, play a test sound
//         // if (enabled) {
//         //     await this.playNotificationSound();
//         // }

//         // Save preferences
//         await this.saveUserPreferences();
//         return true;
//     }

//     // Get all scheduled notifications (for the notification center)
//     async getAllNotifications() {
//         return await this.dbStorage.getAllNotifications();
//     }
// }

// ####### My earlier version of code where sound and notification preferences were not handled. #######

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
    }

    async init() {
        // Initialize the IndexedDB
        await this.dbStorage.open();

        // Load user preferences
        await this.loadUserPreferences();

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
                if (!this.hasBrowserPermission) {
                    // We need to request browser permission first
                    console.log("Requesting browser permission...");

                    // Disable toggle during permission request
                    notificationToggle.disabled = true;

                    try {
                        // Request browser permission
                        const permission = await this.requestBrowserPermission();

                        if (permission === 'granted') {
                            // Permission granted, but don't enable notifications yet
                            this.hasBrowserPermission = true;
                            this.hasPermission = true;
                            this.permissionJustGranted = true;

                            // Reload will happen once the permission is granted, so we cannot show the message via popup, or it won't show.Therefore no need of this function.

                            // // Keep toggle on, but explain the two-step process
                            // this.showPermissionGrantedMessage();

                            // Turn off the toggle - user needs to click again to enable
                            notificationToggle.checked = false;
                            this.notificationsEnabled = false;
                        } else {
                            // Permission denied or dismissed
                            notificationToggle.checked = false;
                            this.notificationsEnabled = false;
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

        // Return if permission and notifications(app) not enabled
        if (!this.hasPermission || !this.notificationsEnabled) return;

        // Get pending notifications that are due
        const pendingNotifications = await this.dbStorage.getPendingNotifications();

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
