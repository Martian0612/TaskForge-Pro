// // test-notification-manager.js
// import { IndexedDBStorage } from './indexedDB-storage.js';
// import { NotificationManager } from './notification-manager.js';

// // Creating mock objects for dependencies
// // const mockCurrentUser = {
// //   username:'testUser'
// // };

// // const mockDbStorage = {

// // };


// async function testNotificationManager() {
//   try {
//     // const notificationManager = new NotificationManager(mockDbStorage, mockCurrentUser);
//     const dbStorage = new IndexedDBStorage('TestDB', 1, mockCurrentUser);
//     await dbStorage.open();

//     const notificationManager = new NotificationManager(dbStorage, mockCurrentUser);
//     await notificationManager.init();
//     console.log('Notification Manager initialized with mocks');
    
//     // Test permission request
//     console.log('Current permission:', await notificationManager.checkPermission());
//     if (notificationManager.hasPermission) {
//       console.log('Permission already granted');
//     } else {
//       console.log('Requesting permission...');
//       const granted = await notificationManager.requestBrowserPermission();
//       console.log('Permission granted?', granted);
//     }
    
//     // Test scheduling a notification
//     if (notificationManager.hasPermission) {
//       const mockTask = {
//         task_id: 'test-task-' + Date.now(),
//         task: 'Test Task',
//         description: 'This is a test task description',
//         dueDate: new Date(Date.now() + 60000), // Due in 1 minute
//         notificationSettings: {
//           enabled: true,
//           notificationTime: new Date(Date.now() + 30000), // Notify in 30 seconds
//           notificationId: null,
//           notified: false
//         }
//       };
      
//       const scheduled = await notificationManager.scheduleNotification(mockTask);
//       console.log('Notification scheduled?', scheduled);
//       console.log('Task with notification:', mockTask);
      
//       // Wait 35 seconds and check if notification fired
//       console.log('Waiting for notification to fire...');
//       setTimeout(async () => {
//         console.log('Checking for notifications that should have fired');
//         await notificationManager.checkForPendingNotifications();
        
//         // Get all notifications to verify it was marked as notified
//         const allNotifications = await notificationManager.getAllNotifications();
//         console.log('All notifications after test:', allNotifications);
//       }, 35000);
//     }
//   } catch (error) {
//     console.error('Test failed:', error);
//   }
// }

// // Run the test when the document is loaded
// document.addEventListener('DOMContentLoaded', testNotificationManager);

// // ###########################################################################
// // Abandoned test

// import { NotificationManager } from './notification-manager.js';

// // Create mock objects for dependencies
// const mockCurrentUser = {
//     username: 'testuser',
//     // Add any other properties your NotificationManager might use
// };

// const mockDbStorage = {
//     open: async () => {},
//     getPreferences: async () => ({ notificationsEnabled: true, soundEnabled: false }),
//     savePreferences: async (prefs) => {},
//     scheduleNotification: async (task) => {},
//     checkForPendingNotifications: async () => [],
//     getAllNotifications: async () => [],
//     updateNotification: async (notification) => {},
//     // Add other mocked methods as needed
// };

// export async function testNotificationManager() {
//     console.log('Running NotificationManager tests...');
//     let notificationManager;
//     let testPassed = true;
//     const errors = [];

//     // Helper function for assertions
//     function assertEqual(actual, expected, message) {
//         if (actual !== expected) {
//             testPassed = false;
//             const errorMessage = `Test Failed: ${message} - Expected: ${expected}, Got: ${actual}`;
//             console.error(errorMessage);
//             errors.push(errorMessage);
//         } else {
//             console.log(`Test Passed: ${message}`);
//         }
//     }

//     // Test case 1: Initialization with default preferences
//     const mockDbStorageDefaultPrefs = { ...mockDbStorage, getPreferences: async () => ({}) };
//     notificationManager = new NotificationManager(mockDbStorageDefaultPrefs, mockCurrentUser);
//     await notificationManager.init();
//     assertEqual(notificationManager.notificationsEnabled, false, 'Init - Default notificationsEnabled');
//     assertEqual(notificationManager.soundEnabled, false, 'Init - Default soundEnabled');

//     // Test case 2: Initialization with specific preferences
//     const mockDbStorageSpecificPrefs = { ...mockDbStorage, getPreferences: async () => ({ notificationsEnabled: true, soundEnabled: true }) };
//     notificationManager = new NotificationManager(mockDbStorageSpecificPrefs, mockCurrentUser);
//     await notificationManager.init();
//     assertEqual(notificationManager.notificationsEnabled, true, 'Init - Specific notificationsEnabled');
//     assertEqual(notificationManager.soundEnabled, true, 'Init - Specific soundEnabled');

//     // Test case 3: scheduleNotification calls dbStorage
//     const scheduleNotificationSpy = jest.fn().mockResolvedValue(true);
//     const mockDbStorageSchedule = { ...mockDbStorage, scheduleNotification: scheduleNotificationSpy };
//     notificationManager = new NotificationManager(mockDbStorageSchedule, mockCurrentUser);
//     const mockTask = { task: 'Test Schedule' };
//     await notificationManager.scheduleNotification(mockTask);
//     if (scheduleNotificationSpy.mock.calls.length === 1 && scheduleNotificationSpy.mock.calls[0][0] === mockTask) {
//         console.log('Test Passed: scheduleNotification calls dbStorage with the task.');
//     } else {
//         testPassed = false;
//         const errorMessage = 'Test Failed: scheduleNotification did not call dbStorage correctly.';
//         console.error(errorMessage);
//         errors.push(errorMessage);
//     }

//     if (!testPassed) {
//         throw new Error(errors.join('\n'));
//     }

//     console.log('NotificationManager tests finished.');
// }