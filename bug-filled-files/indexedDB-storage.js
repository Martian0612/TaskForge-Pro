export class IndexedDBStorage {
    constructor(dbName = 'TaskforgeDB', version = 1, currentUser) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.currentUser = currentUser;
    }

    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log("db inside open is ", db);
                // Create object stores

                // *** objectStoreNames is basically a db(i think) ***
                // It means that if no objectStore that is db for notifications don't exist then create one
                if (!db.objectStoreNames.contains('notifications')) {
                    const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });

                    // Create indices for efficient querying
                    notificationStore.createIndex('taskId', 'taskId', { unique: false });
                    notificationStore.createIndex('timestamp', 'timestamp', { unique: false });
                    notificationStore.createIndex('notified', 'notified', { unique: false });
                    notificationStore.createIndex('userId', 'userId', { unique: false });
                }

                if (!db.objectStoreNames.contains('preferences')) {
                    db.createObjectStore('preferences', { keyPath: 'id' });
                }

            };

            request.onsuccess = event => {
                this.db = event.target.result;
                console.log('IndexedDB successfully opened: ', this.dbName);
                resolve(this.db);
            };

            request.onerror = event => {
                console.error('Error opening IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Save user preferences
    // async savePreferences(preferences) {
    //     return new Promise((resolve, reject) => {
    //         const transaction = this.db.transaction(['preferences'], 'readwrite');
    //         const store = transaction.objectStore('preferences');

    //         // Here we are using currentUser username because we are dealing with multi-user over a single user where we can set a constant id.
    //         preferences.id = `${this.currentUser.username}-preferences`;
    //         console.log(`currentUser preference id is ${this.currentUser.username}-preferences`,)
    //         // Updating the store
    //         const request = store.put(preferences);

    //         request.onsuccess = () => {
    //             console.log("Preferences saved successfully");
    //             resolve(true);
    //         }

    //         request.onerror = (event) => {
    //             console.log("Error in saving preferences: ", event.target.error);
    //             reject(event.target.error);
    //         }
    //     });
    // }
    
    // Solved the notification issue
    async savePreferences(preferences) {
        const transaction = this.db.transaction(['preferences'], 'readwrite');
        const store = transaction.objectStore('preferences');
        
        // Ensure preferences are strictly scoped to current user
        preferences.id = `${this.currentUser.username}-preferences`;
        preferences.userId = this.currentUser.username; // Add explicit user association
        
        await store.put(preferences);
    }

    async getPreferences() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['preferences'], 'readonly');
            const store = transaction.objectStore('preferences');
            console.log("currentUserrr is ", this.currentUser);
            const request = store.get(`${this.currentUser.username}-preferences`);

            request.onsuccess = (event) => {
                const preferences = event.target.result || {
                    id: `${this.currentUser.username}-preferences`,
                    notificationsEnabled: false,
                    soundEnabled: false
                };
                resolve(preferences);
            };

            request.onerror = (event) => {
                console.error("Error getting preferences: ", event.target.error);
                reject(event.target.error);
            };
        });
    }

    // *** This function is of no use now, as now I have getNotificationsByUserId function which is relevant as I have different users and each user have their own notifications. ***

    // async getAllNotifications() {
    //     await this.ensureOpen();

    //     return new Promise((resolve, reject) => {
    //         const transaction = this.db.transaction(['notifications'], 'readonly');
    //         const store = transaction.objectStore('notifications');
    //         const request = store.getAll();

    //         request.onsuccess = event => {
    //             resolve(event.target.result);
    //         }

    //         request.onerror = event => {
    //             console.error('Error fetching notifications:', event.target.error);
    //             reject(event.target.error);
    //         }
    //     });
    // }

    async addNotification(notification) {
        await this.ensureOpen();

        // *** Explicitly making notified boolean ***
        notification.notified = Boolean(notification.notified);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notifications'], 'readwrite');
            const store = transaction.objectStore('notifications');
            const request = store.add(notification);

            request.onsuccess = event => {
                console.log('Notification added successfully: ', notification.id);
                resolve(event.target.result);
            };

            request.onerror = event => {
                console.error("Error adding  notification: ", event.target.error);
                reject(event.target.error);
            };
        });
    }

    async updateNotification(notification) {
        await this.ensureOpen();

        console.log("Notification inside updateNotification is ", notification);
        // Ensure notified is a boolean
        notification.notified = Boolean(notification.notified);
        return new Promise((resolve, reject) => {

            const transaction = this.db.transaction(['notifications'], 'readwrite');
            const store = transaction.objectStore('notifications');
            const request = store.put(notification);

            request.onsuccess = event => {
                console.log('Notification updated successfully: ', notification.id);
                resolve(event.target.result);
            };

            request.onerror = event => {
                console.error("Error updating notification: ", event.target.error);
                reject(event.target.error);
            };
        });
    }

    async deleteNotification(id) {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notifications'], 'readwrite');
            const store = transaction.objectStore('notifications');
            const request = store.delete(id);

            request.onsuccess = event => {
                console.log('Notification deleted successfully: ', id);
                // No need to log the result as we are deleting the notification, so it just need to return true.
                // console.log("event.target.result is ", event.target.result);
                resolve(true);
            };

            request.onerror = event => {
                console.error('Error while deleting notification', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getNotificationByTaskId(taskId) {
        await this.ensureOpen();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notifications'], 'readonly');
            const store = transaction.objectStore('notifications');
            const index = store.index('taskId');
            const request = index.get(taskId);
            // const request = index.getAll(taskId);

            // request.onsuccess = event => {
            //     resolve(event.target.result.length > 0 ? event.target.result[0] : null);
            //     // resolve(event.target.result);
            // };

            // request.onerror = event => {
            //     console.error('Error fetching notifications by taskId: ', event.target.error);
            //     reject(event.target.error);
            // };

            request.onsuccess = () => {
                console.log(`Successfully fetched notifications for taskId: ${taskId}`, request.result);
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error(`Error fetching notifications for taskId: ${taskId}`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Get notifications by userId

    async getNotificationsByUserId(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notifications'], 'readonly');
            const store = transaction.objectStore('notifications');
            const index = store.index('userId'); // Assuming you have an index on the 'userId' field

            const request = index.getAll(userId);

            // request.onsuccess = event => {
            //     resolve(event.target.result.length > 0 ? event.target.result[0] : null);
            //     // resolve(event.target.result);
            // };

            // request.onerror = event => {
            //     console.error('Error fetching notifications by taskId: ', event.target.error);
            //     reject(event.target.error);
            // };         

            request.onsuccess = () => {
                console.log(`Successfully fetched notifications for userId: ${userId}`, request.result);
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error(`Error fetching notifications for userId: ${userId}`, event.target.error);
                reject(event.target.error);
            };
        });
    }


    async getPendingNotifications(userId) {
        await this.ensureOpen();
        const now = Date.now();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notifications'], 'readonly');
            const store = transaction.objectStore('notifications');
            // const index = store.index('notified');
            // const request = index.getAll(false); // // Get all non-notified notifications
            const request = store.getAll();

            request.onsuccess = event => {
                // Filter for notifications that should be shown now
                // Trying to know whether its an array or not.
                console.log("raw notifications data is, ", event.target.result);

                const allNotifications = Array.isArray(event.target.result) ? event.target.result : [];
                console.log(`Found ${allNotifications.length} total notifications in database`);
                console.log("Current user username who have notification is ", userId);
                // Filter for notifications that should be shown now
                const pendingNotifications = allNotifications.filter(
                    notification => {
                        // Converting timestamp to number.
                        const timestamp = Number(notification.timestamp);
                        console.log("timestamp is ", timestamp);
                        console.log("notification notifed is ", notification.notified);
                        // Ensure notified is boolean false (not undefined, null, etc)
                        const isPending = !isNaN(timestamp) &&
                            timestamp <= now &&
                            notification.notified === false &&
                            // notification.notified === false;
                            notification.userId === userId;
                        if (isPending) {
                            console.log("Found pending notification to display for user: ",userId, notification);
                        }
                        else if (!isNaN(timestamp) && timestamp <= now) {
                            console.log("Notification due but already notified or wrong user:", notification);
                        }

                        return isPending;
                    });

                console.log(`Filtered ${pendingNotifications.length} pending notifications for user ${userId}`);
                resolve(pendingNotifications);
            };

            request.onerror = event => {
                console.error('Error fetching pending notifications: ', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async ensureOpen() {
        if (!this.db) {
            await this.open();
        }
    }

    // No more needed as we are working with the actual data.

    // async debugDB() {
    //     await this.ensureOpen();

    //     return new Promise((resolve, reject) => {
    //         const transaction = this.db.transaction(['notifications'], 'readonly');
    //         const store = transaction.objectStore('notifications');
    //         const request = store.getAll();

    //         request.onsuccess = event => {
    //             const notifications = event.target.result;
    //             console.group('IndexedDB Debug Info');
    //             console.log('Total notifications:', notifications.length);
    //             notifications.forEach(n => {
    //                 console.log('-------------------');
    //                 console.log('ID:', n.id);
    //                 console.log('TaskID:', n.taskId);
    //                 console.log('Timestamp:', new Date(n.timestamp));
    //                 console.log('Notified:', n.notified);
    //                 console.log('Type of notified:', typeof n.notified);
    //             });
    //             console.groupEnd();
    //             resolve(notifications);
    //         };

    //         request.onerror = event => reject(event.target.error);
    //     });
    // }
}

