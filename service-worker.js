// Here self is service worker and we are firstly installing it, then activating it and doing other stuff.

self.addEventListener('install',() => {
// self.addEventListener('install',event => {
    console.log('Service worker installed');
    self.skipWaiting(); // Don't wait for anything after installation. Activate things
});

self.addEventListener('activate', ()=> {
// self.addEventListener('activate', event => {
    console.log('Service worker activated');
    // May be verifying or finding the client.
    return self.clients.claim();
});

// Listen for notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked', event.notification.tag);

    // Close the notification
    event.notification.close();

    // Get the notification data
    const notificationData = event.notification.data;
    console.log('Notification data after clicking the system notification is ', notificationData);

    // Open the app and focus on the specific task
    event.waitUntil(
        clients.matchAll({type: 'window'}).then(clientList => {

            // If there's an open window, focus it
            for (const client of clientList){
                if (client.url.includes('/index.html') && 'focus' in client) {
                // if (client.url === '/' && 'focus' in client) {
                    return client.focus().then(() => {
                        // Send a message to the client to focus on the task
                        if (notificationData && notificationData.taskId) {
                            return client.postMessage({
                                command: 'focusTask',
                                taskId: notificationData.taskId
                            });
                        }
                    });
                }
            }

            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});