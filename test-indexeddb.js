// import { IndexedDBStorage } from "./indexedDB-storage.js";

// const mockCurrentUser = {
//   username: 'testUser'
// };

// async function testIndexedDB() {
//   try {
//     const dbStorage = new IndexedDBStorage('TestDB', 1, mockCurrentUser);
//     await dbStorage.open();
//     console.log('Database opened successfully');
    
//     // Test adding a notification
//     const testNotification = {
//       id: `test-notification-${Date.now()}`,
//       taskId: 'test-task-1',
//       title: 'Test Notification',
//       body: 'This is a test notification',
//       timestamp: Date.now(),
//       notified: false
//     };
    
//     await dbStorage.addNotification(testNotification);
//     console.log('Test notification added');
    
//     // Test fetching all notifications
//     const allNotifications = await dbStorage.getAllNotifications();
//     console.log('All notifications:', allNotifications);
    
//     // Test updating a notification
//     testNotification.notified = true;
//     await dbStorage.updateNotification(testNotification);
//     console.log('Test notification updated');
    
//     // Test fetching notifications by task ID
//     const taskNotifications = await dbStorage.getNotificationsByTaskId('test-task-1');
//     console.log('Notifications for test-task-1:', taskNotifications);
    
//     // Test deleting a notification
//     await dbStorage.deleteNotification(testNotification.id);
//     console.log('Test notification deleted');
    
//     const afterDelete = await dbStorage.getAllNotifications();
//     console.log('Notifications after delete:', afterDelete);
    
//     console.log('All tests completed successfully');
//   } catch (error) {
//     console.error('Test failed:', error);
//   }
// }

// // Run the test
// document.addEventListener('DOMContentLoaded', testIndexedDB);

// #########################################################################

// Abandoned test

// import { IndexedDBStorage } from "./indexedDB-storage.js";

// // Create a mock currentUser for IndexedDBStorage
// const mockCurrentUserForDB = {
//     username: 'testuser'
//     // Add any other properties IndexedDBStorage might use from currentUser
// };

// export async function testIndexedDB() {
//     console.log('Running IndexedDB tests...');
//     let dbStorage;
//     let testPassed = true;
//     const errors = [];

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

//     function assertTruthy(actual, message) {
//         if (!actual) {
//             testPassed = false;
//             const errorMessage = `Test Failed: ${message} - Expected a truthy value, Got: ${actual}`;
//             console.error(errorMessage);
//             errors.push(errorMessage);
//         } else {
//             console.log(`Test Passed: ${message}`);
//         }
//     }

//     try {
//         dbStorage = new IndexedDBStorage(mockCurrentUserForDB);
//         await dbStorage.open();
//         console.log('Database opened successfully');

//         const testNotification = {
//             id: `test-notification-${Date.now()}`,
//             taskId: 'test-task-1',
//             title: 'Test Notification',
//             body: 'This is a test notification',
//             timestamp: Date.now(),
//             notified: false
//         };

//         await dbStorage.addNotification(testNotification);
//         console.log('Test notification added');

//         let allNotifications = await dbStorage.getAllNotifications();
//         console.log('All notifications:', allNotifications);
//         assertTruthy(Array.isArray(allNotifications) && allNotifications.length >= 1, 'getAllNotifications returned at least one notification');

//         testNotification.notified = true;
//         await dbStorage.updateNotification(testNotification);
//         console.log('Test notification updated');

//         let taskNotifications = await dbStorage.getNotificationsByTaskId('test-task-1');
//         console.log('Notifications for test-task-1:', taskNotifications);
//         assertTruthy(Array.isArray(taskNotifications) && taskNotifications.length >= 1, 'getNotificationsByTaskId returned at least one notification');

//         await dbStorage.deleteNotification(testNotification.id);
//         console.log('Test notification deleted');

//         const afterDelete = await dbStorage.getAllNotifications();
//         console.log('Notifications after delete:', afterDelete);
//         assertEqual(afterDelete.length, allNotifications.length - 1, 'deleteNotification removed one notification');

//         console.log('IndexedDB tests completed successfully');
//     } catch (error) {
//         console.error('Test failed:', error);
//         throw error;
//     } finally {
//         if (dbStorage) {
//             dbStorage.close();
//         }
//     }

//     if (!testPassed) {
//         throw new Error(errors.join('\n'));
//     }
// }