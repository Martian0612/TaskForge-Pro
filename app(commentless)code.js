import {
    clearModalForm, handleFormSubmit, handleModalFormData, populateModalForm, showFormErrors, showSuccess, handleReminderFormData,
    clearReminderForm, updateReminderPreview, calculateReminderOffset
} from "./ui.js";
import { User } from "./data.js";
import { PageManager } from "./navigation.js";
import { FormValidator } from "./validation.js";
import { DeletionManager } from "./deletionManagement.js";
import { tagHandler, updateTaskCardTags } from "./tagManagement.js";
import { IndexedDBStorage } from "./indexedDB-storage.js";
import { NotificationManager } from "./notification-manager.js";

// Application state object to track UI preferences
const appState = {
    // View preferences
    currentView: "card", // Default view mode (card or list)

    // Sorting preferences
    currentSort: "newestFirst", // Default sort option

    // Filter state
    activeFilters: {
        status: [], // Array of active status filters
        priority: [], // Array of active priority filters
        time: [] // Array of active time filters
    },

    // Search state
    searchTerm: "", // Current search term

    // Current user
    currentUser: null, // Reference to current user object

    // Reset all preferences when switching users
    resetForUserSwitch() {
        this.currentView = "card"; // Reset to card view
        this.currentSort = "newestFirst"; // Reset to default sort
        this.activeFilters = { status: [], priority: [], time: [] }; // Clear all filters
        this.searchTerm = ""; // Clear search term
    },

    // Reset search only (when switching views)
    resetSearch() {
        this.searchTerm = "";
    }
};

// Export the application state
// This will be available globally as appState
window.appState = appState;

// Show the global overlay
// export function showGlobalOverlay(){
function showGlobalOverlay() {
    document.querySelector('.global-overlay').style.display = 'block';
}

// Hide the global overlay
// export function hideGlobalOverlay(){
function hideGlobalOverlay() {
    document.querySelector('.global-overlay').style.display = 'none';
}

export const userListKey = 'userList';
export const userMap = new Map();

// Store the task ID for which we're setting a reminder
let currentReminderTaskId = null;
let reminderFlatpickr = null;

// For task editing and using it in displayTasks function, making this variables global

let isEditMode = false;
let editTaskId = null;
let modal = null;

// Load from local storage and populate the userMap
const storedUsers = JSON.parse(localStorage.getItem(userListKey)) || [];

storedUsers.forEach(userData => {
    const user = User.fromData(userData);
    userMap.set(user.email, user);
});

let userList = Array.from(userMap.values()); // Create userList from userMap

// export let currentUser = null;
let currentUser = null;
let deletionManagerInstance;
let dbStorageInstance;
let notificationManagerInstance;

const pageManager = new PageManager();

// Populate user list and also handling switching of user and handling resetting of states when switching users.

function populateUserList() {

    const selectUserBtn = document.getElementById("selectUserBtn");
    const userListElement = document.getElementById("userList");

    // Clear existing user list
    userListElement.innerHTML = '';

    // If no users exist, hide the select button and show message
    if (!userList.length) {
        selectUserBtn.style.display = "none";
        userListElement.innerHTML = `
        <div class="no-users-message">
        No existing users found. Please create an account first.
        </div>`;
        return;
    }

    // Show the select button if users exist
    selectUserBtn.style.display = "block";

    // Create user items
    userList.forEach((user, index) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.dataset.index = index;

        // Get initials for avatar
        const initials = user.username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        userItem.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
        <div class="name">${user.username}</div>
        <div class="email">${user.email}</div>
        </div>
        `;

        // Add click handler
        userItem.addEventListener('click', () => {
            // Reset app state for user switch
            appState.resetForUserSwitch();

            // Update current user reference
            currentUser = userList[index];
            appState.currentUser = currentUser;

            // Reset UI states
            resetViewToggle();
            resetFilterUI();

            // Clear search input
            const searchInput = document.querySelector(".search-container input");
            if (searchInput) {
                searchInput.value = "";
            }

            // Reset sort dropdown to default
            const sortDropdown = document.querySelector('.sort-container select');
            if (sortDropdown) {
                sortDropdown.value = appState.currentSort;
            }

            // Initializing all the modules that use currentUser or injecting currenUser to the modules that depend on it.(Applying dependency injection design pattern.)
            // Call a function to initialize dependent modules
            initializeModules(currentUser);

            updateProfileView(currentUser);
            pageManager.showPage('profile');
            // const func = setupModalHandlers();
            // func.displayTasks(currentUser);

            // Display tasks with default settings
            refreshTaskDisplay();
            // displayTasks(currentUser, currentUser["taskList"]);

            // Close the user modal
            userModal.classList.remove('active');
        });
        userListElement.appendChild(userItem);
    });
}



async function initializeModules(currentUser) {
    try {
        dbStorageInstance = new IndexedDBStorage('TaskforgeDB', 1, currentUser);
        // dbStorageInstance = new IndexedDBStorage(currentUser);
        // Open the database
        await dbStorageInstance.open();

        notificationManagerInstance = new NotificationManager(dbStorageInstance, currentUser);
        const initResult = await notificationManagerInstance.init();

        // Log initialization state instead of warnings
        console.log('Notification system initialized:', {
            success: initResult,
            hasPermission: notificationManagerInstance.hasPermission,
            notificationsEnabled: notificationManagerInstance.notificationsEnabled,
            serviceWorker: !!notificationManagerInstance.serviceWorkerRegistration
        });

        // Initialize UI after everything is ready
        notificationManagerInstance.initUI();

        // Return the initialization result
        return initResult;
    }
    catch (error) {
        console.error('Error initializing modules:', error);
        return false;
    }
}

// For modal handling of user
function setupUserModal() {
    const userModal = document.getElementById("userModal");
    const selectUserBtn = document.getElementById("selectUserBtn");
    const closeUserModal = document.getElementById("closeUserModal");

    selectUserBtn.addEventListener("click", () => {
        userModal.classList.add('active');
    });

    closeUserModal.addEventListener("click", () => {
        userModal.classList.remove('active');
    })

    // Close modal if clicking outside
    userModal.addEventListener("click", (e) => {
        if (e.target === userModal) {
            userModal.classList.remove('active');
        }
    });

}

// Helper Function for getting status and priority emoji
const getStatusEmoji = (status) => {
    switch (status) {
        case 'not started': return '⭕';
        case 'in progress': return '⏳';
        case 'completed': return '✅';
        default: return '⭕';
    }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const getPriorityEmoji = (priority) => {
    switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🔵';
        default: return '⚪';
    }
};

function initViewToggle() {
    const viewAllButton = document.querySelector(".view-all-button");
    const viewToggleIcon = viewAllButton.querySelector('i');
    const viewToggleText = viewAllButton.querySelector('span');

    if (viewAllButton) {
        // Set initial state based on app state
        viewAllButton.dataset.viewMode = appState.currentView;
        if (appState.currentView === "card") {
            viewToggleIcon.textContent = "view_list"; // Show icon for switching to list view
            viewToggleText.textContent = "View All Tasks";
        }
        else {
            viewToggleIcon.textContent = "view_module";  // Show icon for switching to card view
            viewToggleText.textContent = "Dashboard";
        }


        viewAllButton.addEventListener("click", function () {
            // Toggle between views
            const newView = appState.currentView === "card" ? "list" : "card";

            // Update app state
            appState.currentView = newView;

            // Update button state
            this.dataset.viewMode = newView;

            // Update button text and icon
            if (newView === "card") {
                viewToggleIcon.textContent = "view_list"; // Show list icon (next state)
                viewToggleText.textContent = "View All Tasks";
            } else {
                viewToggleIcon.textContent = "view_module"; // Show card icon (next state)
                viewToggleText.textContent = "Dashboard";
            }

            // Reset search when switching views (but keep filters and sorting)
            const { clearSearch } = setupSearch();
            clearSearch();
            appState.resetSearch();

            // Refresh task display with new view mode
            refreshTaskDisplay();
            // Re-render tasks with new view mode
            // displayTasks(currentUser, currentUser.taskList, "", newView);
        });
    }
}

function resetViewToggle() {
    const viewAllButton = document.querySelector(".view-all-button");


    if (viewAllButton) {
        const viewToggleIcon = viewAllButton.querySelector('i');
        const viewToggleText = viewAllButton.querySelector('span');
        // Reset to card view in app state
        appState.currentView = "card";

        viewAllButton.dataset.viewMode = "card";
        viewToggleIcon.textContent = "view_list";
        viewToggleText.textContent = "View All Tasks";
    }
}



// A version of displayTasks including list view mode.

async function displayTasks(user, current_task_ls, message = "", viewMode = "card", focusedTaskId = null) {
    console.log("user_task_ls inside displayTasks func. ", current_task_ls);
    console.log("I am inside displayTasks function. View mode: ", viewMode);
    const taskDisplay = document.querySelector("#task-display");

    // Creating a shallow copy is a good practice, earlier we are directly assigning it to user_task_ls
    let user_task_ls = [...current_task_ls];
    // console.log("currentUser task list is ", current_task_ls);
    // Reversing the list either shallow or the original list without condition for checking whether any sort applied or not will give weird results, like not sorting by oldest first or at some other places maybe.
    // user_task_ls.reverse();
    // here we were reversing the original list that we got from the function.
    // let user_task_ls = current_task_ls.reverse();
    // console.log("userTask list after reversing is ", user_task_ls);

    console.log('UserTask list is ', user_task_ls);

    if (message) {
        taskDisplay.innerHTML = `<div class="no-tasks-container"><p class="no-tasks-message">${message}</p></div>`;
        return;
    }

    // Clear the display area based on the view mode
    if (viewMode === "card") {
        taskDisplay.innerHTML = '<div class="task-container"></div>';
        const cardContainer = taskDisplay.querySelector('.task-container');

        for (const task of user_task_ls) {
            const taskCard = document.createElement("div");
            taskCard.className = "task-card";
            taskCard.dataset.taskId = task.task_id;
            taskCard.id = `task-${task.task_id}`;

            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
            const hasReminder = await checkExistingNotification(task.task_id);
            console.log("hasReminder is ", hasReminder);

            const bellButtonHTML = `
                <button class="reminder-button" id="reminder-btn-${task.task_id}" data-task-id="${task.task_id}" data-reminder-set="${hasReminder}">
                    ${getBellIconHTML(hasReminder, task.dueDate)}
                </button>`;

            taskCard.innerHTML = `
                <div class="task-selection">
                    <div class="task-checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.task_id}">
                        <div class="checkbox-custom"></div>
                    </div>
                    <i class="material-icons delete-icon" data-task-id="${task.task_id}">delete</i>
                </div>
                <div class="card-header">
                    <h3 class="task-title">${task.task}</h3>
                    <div class="status-priority">
                        <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
                        <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
                            <span>${getPriorityEmoji(task.priority)}</span>
                            <span>${capitalize(task.priority)}</span>
                        </div>
                    </div>
                </div>
                <div class="tags-container"> </div>
                <div class="card-footer">
                    <button class="tag-button" id="tag-btn-${task.task_id}" data-task-id="${task.task_id}">
                        <span>Add Tag</span>
                    </button>
                     ${bellButtonHTML}
                </div> `;

            cardContainer.appendChild(taskCard);
            updateTaskCardTags(task, userListKey, userMap);

            // If this is the focused task, highlight it
            if (focusedTaskId && task.task_id === focusedTaskId) {
                setTimeout(() => {
                    focusTaskInUI(task);
                    highlightTask(focusedTaskId);
                }, 200); // Delay to ensure DOM is updated
            }
        }
    } else {
        // LIST VIEW - new implementation
        taskDisplay.innerHTML = '<div class="task-list-container"></div>';
        const listContainer = taskDisplay.querySelector('.task-list-container');

        // Render each task as a list item
        for (const task of user_task_ls) {
            const taskListItem = document.createElement("div");
            taskListItem.className = "task-list-item";
            taskListItem.dataset.taskId = task.task_id;
            taskListItem.id = `task-list-${task.task_id}`;

            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();

            // Making sure checkbox and delete icon structure matches card view
            taskListItem.innerHTML = `
                <div class="task-selection">
                    <div class="task-checkbox-wrapper">
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.task_id}">
                        <div class="checkbox-custom"></div>
                    </div>
                    <i class="material-icons delete-icon" data-task-id="${task.task_id}">delete</i>
                </div>
                <div class="list-item-content" data-task-id="${task.task_id}">
                    <div class="list-item-main">
                        <span class="list-item-title">${task.task}</span>
                        <div class="list-item-indicators">
                            <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
                            <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
                                <span>${getPriorityEmoji(task.priority)}</span>
                                <span>${capitalize(task.priority)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="list-item-details">
                        <span class="list-item-date">${formattedDate}</span>
                    </div>
                </div>
            `;

            listContainer.appendChild(taskListItem);
        }
    }

    // Newest version
    document.querySelectorAll('.task-card').forEach(taskCard => {
        taskCard.addEventListener('mouseenter', function () {
            this.classList.add('interactive-hover');
        });
        taskCard.addEventListener('mouseleave', function () {
            this.classList.remove('interactive-hover');
        });
    });

    // Set up task item click handlers
    function handleTaskDisplayClick(event) {
        // Your existing card click handlers
        if (viewMode === "card") {
            console.log("event.target is ", event.target);
            if (!event.target.closest('.task-card')) return;

            // Tag button handler
            if (event.target.matches('.tag-button') || event.target.closest('.tag-button')) {
                // Your existing tag button handler
                console.log("user is ", userList.find(user => user.username === "marshian2511"));

                const predefinedTags = [
                    { value: uuidv4(), text: "Work" },
                    { value: uuidv4(), text: "Personal" },
                    { value: uuidv4(), text: "Urgent" }
                ];
                event.stopPropagation();
                const taskCard = event.target.closest('.task-card');
                const taskId = taskCard.dataset.taskId;
                console.log("Tag button clicked for task: ", taskId);
                const tagModal = document.getElementById('tag-modal');
                tagModal.dataset.taskid = taskId;
                tagModal.style.display = 'block';
                tagHandler(userListKey, userMap, currentUser, predefinedTags, tagModal);
                return;
            }

            // Reminder button handler
            if (event.target.matches('.reminder-button') || event.target.closest('.reminder-button')) {
                // Your existing reminder button handler
                event.stopPropagation();
                const taskId = event.target.closest('.task-card').dataset.taskId;
                const task = currentUser.taskList.find(t => t.task_id === taskId);
                if (!task.dueDate) {
                    return;
                }
                currentReminderTaskId = taskId;
                showReminderModal(taskId);
                const setReminderBtn = document.getElementById('set-reminder-btn');
                if (setReminderBtn) {
                    setReminderBtn.removeEventListener('click', handleSetReminderButtonClick);
                    setReminderBtn.addEventListener('click', handleSetReminderButtonClick);
                }
                return;
            }

            // Task card click handler (open edit modal)
            if (event.target.closest('.task-card') &&
                !event.target.matches('.task-checkbox') &&
                !event.target.closest('.task-checkbox-wrapper') &&
                !event.target.matches('.delete-icon') &&
                !event.target.closest('.delete-icon')) {
                const taskCard = event.target.closest('.task-card');
                console.log("taskCard is ", taskCard);
                const taskId = taskCard.dataset.taskId;
                console.log("Task card clicked, opening edit modal", taskId);
                document.getElementById("modal-title").textContent = "Update Task";
                isEditMode = true;
                editTaskId = taskId;

                const storedUsers = localStorage.getItem(userListKey);
                if (storedUsers) {
                    const usersArray = JSON.parse(storedUsers);
                    const currentUserData = usersArray.find(u => u.username === currentUser.username);
                    if (currentUserData && currentUserData.taskList) {
                        const task = currentUserData.taskList.find(t => t.task_id === taskId);
                        console.log("Task for edit (user switch):", task);
                        populateModalForm(task);
                        modal.style.display = "block";
                    } else {
                        console.error("Error: Could not find current user or their tasks.");
                    }
                } else {
                    console.error("Error: Could not retrieve user list.");
                }
            }
        } else {
            // List item click handlers

            // Click on task checkbox or delete icon - don't open the modal
            if (event.target.matches('.task-checkbox') ||
                event.target.closest('.task-checkbox-wrapper') ||
                event.target.matches('.delete-icon') ||
                event.target.closest('.delete-icon')) {
                return;
            }

            // Click on list item content - open edit modal
            if (event.target.closest('.list-item-content')) {
                const listItem = event.target.closest('.task-list-item');
                const taskId = listItem.dataset.taskId;
                console.log("List item clicked, switching to card view for task:", taskId);

                // Update the view-all-button state
                const viewAllButton = document.querySelector(".view-all-button");
                if (viewAllButton) {
                    viewAllButton.dataset.viewMode = "card";
                    viewAllButton.querySelector('i').textContent = "view_list";
                    viewAllButton.querySelector('span').textContent = "View All Tasks";
                }

                // Switch to card view and focus the task
                displayTasks(currentUser, currentUser.taskList, "", "card", taskId);
            }
        }
    }

    // Remove existing and add new event listener
    taskDisplay.removeEventListener("click", handleTaskDisplayClick);
    taskDisplay.addEventListener("click", handleTaskDisplayClick);
}

function getBellIconHTML(hasReminder, hasDueDate) {
    let svgContent = '';
    let tooltipText = '';

    if (hasReminder) {
        // Ring bell for active reminders

        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <path d="M2 8c0-2.2.7-4.3 2-6" stroke="currentColor" stroke-width="2"></path>
                <path d="M22 8a10 10 0 0 0-2-6" stroke="currentColor" stroke-width="2"></path>
            </svg>
        `;

        tooltipText = 'Update/Remove Reminder';
    } else if (hasDueDate) {
        // Gold bell (for tasks with due date no reminder)
        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
        `;
        const dueDate = new Date(hasDueDate);
        const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
        tooltipText = `Set reminder (${formattedDate})`;
    } else {
        // Grey bell (for tasks with no due date)
        svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
        `;
        tooltipText = 'Set date and time';
    }

    return `
        <span class="bell-icon">
                ${svgContent}
        </span>
        <div class="reminder-tooltip">${tooltipText}</div>
    `;
}

async function handleNotificationSubmit(event) {
    event.preventDefault();
    if (!currentReminderTaskId) return;

    const formData = handleReminderFormData();
    if (!formData.presetValue && !formData.customTime) {
        showFormErrors(['Please select a reminder time'], 'reminder-form');
        return;
    }

    const task = currentUser.taskList.find(t => t.task_id === currentReminderTaskId);
    if (!task) {
        console.error('Task not found for ID:', currentReminderTaskId);
        showFormErrors(['Task not found'], 'reminder-form');
        return;
    }
    const dueDate = new Date(task.dueDate);
    let reminderDate = new Date(dueDate);
    let reminderOffsetMs = 0;

    reminderOffsetMs = calculateReminderOffset(formData);
    console.log("dueDate is ", dueDate);
    console.log("reminderOffsetMs is ", reminderOffsetMs);
    reminderDate = new Date(dueDate.getTime() - reminderOffsetMs);

    const notificationData = {
        id: uuidv4(),
        taskId: currentReminderTaskId,
        taskName: task.task,
        dueDate: task.dueDate,
        // dueDate: task.dueDate,
        reminderDate: reminderDate.toISOString(),
        // Store the offset to easily extract or populate the reminder modal in case of updates.
        reminderOffsetMs: reminderOffsetMs,
        userId: currentUser.username,
        priority: task.priority,
        timestamp: reminderDate.getTime(), // Need to work on getting the exact timestamp for notification center.
        notified: false, // Explicitly set to false for new notifications.
        createdAt: new Date().toISOString(), // Maybe not needed, still thinking.
        // For updating the notification via reminder or when updating the task.
        // updatedAt: createdAt, // this is not working, getting error that currentAt not defined.

        // I think null is better because initially we don't know about updated time as updatedAt value only need to exist, when it is actually updated.
        updatedAt: null,
        // updatedAt: new Date().toISOString(),

        // For new notifications
        isUpdated: false,
        // Form marking notification as read when user clicks on the notification in notification center.
        isRead: false,
        // This property is for acknowledging the notification when user clicks on the notification.
        isAcknowledged: false
    };
    console.log("reminder offset after creating notification is ", reminderOffsetMs);
    console.log("notificationData is ", notificationData);

    // Save to IndexedDB
    const existingNotification = await dbStorageInstance.getNotificationByTaskId(currentReminderTaskId);

    console.log("Reminder already exists for this task:", existingNotification);
    console.log("Existing Notification Due Date:", existingNotification?.dueDate);
    console.log("Existing Notification Reminder Date:", existingNotification?.reminderDate);
    // const reminderButton = document.querySelector(`[data-task-id="${currentReminderTaskId}"]`);
    const reminderButton = document.getElementById(`reminder-button-${currentReminderTaskId}`);
    console.log("currentReminderTaskId before updating or adding the notification.", currentReminderTaskId);
    const modalFooter = document.querySelector('.modal-footer');
    if (existingNotification) {
        console.log("I am in existing notification ");
        // Use existing notification id for updates.
        notificationData.id = existingNotification.id;
        notificationData.notified = false;
        // Mark the notification as updated
        notificationData.isUpdated = true;
        // Updating the updatedAt field to the current date and time when updating the reminder.
        notificationData.updatedAt = new Date().toISOString();
        // If there are existing notifications, update the first one
        // await dbStorageInstance.updateNotification(notificationData,notificationData.id);
        await dbStorageInstance.updateNotification(notificationData);
        console.log('Reminder updated for:', task.task);
        showSuccess('Reminder updated successfully');
        // updateBellStateOnUI(currentReminderTaskId, true);
        updateBellIcon(currentReminderTaskId, true);

        // Manually calling the showNotification function to update the notification. Because it is just playing sound not showing the notification.
        // await notificationManagerInstance.showNotification(notificationData);
        // notificationData.notified = true;

        // For updating case add proper spacing classes to handle both set reminder and remove button
        modalFooter.classList.add('two-buttons');
        modalFooter.classList.remove('single-button');
        // return; // Was adding return earlier because earlier it was not working so just trying some tweeks.
    } else {
        // If there are no existing notifications, add a new one
        modalFooter.classList.add('single-button');
        modalFooter.classList.remove('two-buttons');
        await dbStorageInstance.addNotification(notificationData)
            .then(() => {
                console.log('Reminder set for:', notificationData);
                updateBellIcon(currentReminderTaskId, true);
                showSuccess('Reminder set successfully');
            })
            .catch(error => {
                console.error('Error setting reminder:', error);
                showFormErrors(['Failed to set reminder'], 'reminder-form');
            });
    }

    document.getElementById('reminder-modal').style.display = 'none';
    currentReminderTaskId = null;
    console.log("currentReminderTaskId after updating or adding the notification.", currentReminderTaskId);
    clearReminderForm();
}

function updateBellIcon(taskId, hasReminder) {
    const reminderButton = document.querySelector(`.task-card[data-task-id="${taskId}"] .reminder-button`);
    if (!reminderButton) return;

    const task = currentUser.taskList.find(t => t.task_id === taskId);
    if (!task) return;

    reminderButton.innerHTML = getBellIconHTML(hasReminder, task.dueDate);
    reminderButton.dataset.reminderSet = hasReminder;
    reminderButton.classList.toggle('setting-reminder', hasReminder);
}

function handleSetReminderButtonClick() {
    const reminderButton = document.querySelector(`.task-card[data-task-id="${currentReminderTaskId}"] .reminder-button`);
    const task = currentUser.taskList.find(t => t.task_id === currentReminderTaskId);
    if (reminderButton && task && task.dueDate) {
        reminderButton.classList.add('setting-reminder');
        reminderButton.innerHTML = getBellIconHTML(true, task.dueDate);
    }
}
async function checkExistingNotification(taskId) {
    const existingNotification = await dbStorageInstance.getNotificationByTaskId(taskId);
    return existingNotification !== null;
}

async function removeTaskReminder(taskId) {
    try {
        const existingNotification = await dbStorageInstance.getNotificationByTaskId(taskId);
        if (!existingNotification) {
            console.log('No reminder found to remove');
            return;
        }

        // Delete the notification using its ID
        await dbStorageInstance.deleteNotification(existingNotification.id);
        console.log('Reminder removed for task ID:', taskId);
        showSuccess('Reminder removed successfully');

        // Update the bell icon state
        updateBellIcon(taskId, false);
    } catch (error) {
        console.error('Error removing reminder:', error);
        showFormErrors(['Failed to remove reminder'], 'reminder-form');
    }
}

let customInputTouched = false;
function setupReminderModal() {
    const reminderModal = document.getElementById('reminder-modal');
    const closeReminderModalBtn = document.getElementById('close-reminder-modal');
    const reminderForm = document.getElementById('reminder-form');
    const presetChips = document.querySelectorAll('.preset-chip');
    const removeReminderBtn = document.getElementById('remove-reminder-btn');
    const timeInputs = document.querySelectorAll('.time-input');
    const daysInput = document.getElementById('days-input');
    const hoursInput = document.getElementById('hours-input');
    const minutesInput = document.getElementById('minutes-input');



    // Event listeners to track custom time input interaction
    timeInputs.forEach(input => {
        input.addEventListener('focus', () => {
            console.log("We are about to set customInputs ...", customInputTouched);
            customInputTouched = true;
            // Deselect all preset chips when custom input is focused
            presetChips.forEach(chip => chip.classList.remove('selected'));
        });
        input.addEventListener('input', () => {
            customInputTouched = true;
            // Deselect all preset chips when custom input is changed
            presetChips.forEach(chip => chip.classList.remove('selected'));
        });
    });

    // Handle preset chip selection
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            presetChips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            customInputTouched = false; // Reset flag when preset is selected
            document.getElementById('days-input').value = '0';
            document.getElementById('hours-input').value = '0';
            document.getElementById('minutes-input').value = '0';
            updateReminderPreview();
        });
    });

    // Initialize the reminder preview
    updateReminderPreview();

    // Handle closing the modal
    closeReminderModalBtn.addEventListener('click', () => {
        reminderModal.style.display = 'none';
        currentReminderTaskId = null;
        clearReminderForm();
        customInputTouched = false; // Reset flag on modal close
    });

    // Handle form submission
    reminderForm.addEventListener('submit', handleNotificationSubmit);

    // Handle remove reminder button
    removeReminderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentReminderTaskId) {
            removeTaskReminder(currentReminderTaskId);
            reminderModal.style.display = 'none';
            currentReminderTaskId = null;
            customInputTouched = false; // Reset flag on reminder removal
        }
    });
}

async function showReminderModal(taskId) {
    const reminderModal = document.getElementById('reminder-modal');
    const removeReminderBtn = document.getElementById('remove-reminder-btn');
    const existingNotification = await dbStorageInstance.getNotificationByTaskId(taskId);
    console.log("Reminder already exists for this task:", existingNotification);

    currentReminderTaskId = taskId;
    clearReminderForm();

    const daysInput = document.getElementById('days-input');
    const hoursInput = document.getElementById('hours-input');
    const minutesInput = document.getElementById('minutes-input');

    // Redundant as we are no more using 
    // const presetChips = document.querySelectorAll('.preset-chip');

    if (existingNotification && existingNotification.reminderOffsetMs !== undefined) {
        removeReminderBtn.style.display = 'block';

        const offsetMs = existingNotification.reminderOffsetMs;

        // Redudant line as we are already suing clearReminderForm
        // presetChips.forEach(chip => chip.classList.remove('selected')); // Deselect all presets initially

        const days = Math.floor(offsetMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor((offsetMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((offsetMs % (60 * 1000)) / (60 * 1000));

        // Check if custom values were ever explicitly set (even if they match a preset)
        if (days > 0 || hours > 0 || (minutes > 0 || minutes === 15)) {
            console.log("customInputTouched... ", customInputTouched);
            daysInput.value = days;
            hoursInput.value = hours;
            minutesInput.value = minutes;
        } else {
            // If no custom values were explicitly set (likely a preset was used), select the matching preset
            if (offsetMs === (15 * 60 * 1000)) {
                document.querySelector(`.preset-chip[data-value="15min"]`)?.classList.add('selected');
            } else if (offsetMs === (60 * 60 * 1000)) {
                document.querySelector(`.preset-chip[data-value="1hour"]`)?.classList.add('selected');
            } else if (offsetMs === (24 * 60 * 60 * 1000)) {
                document.querySelector(`.preset-chip[data-value="1day"]`)?.classList.add('selected');
            }
            // I think redundant as this case is already handled and if block.
            // If no preset match, but offset > 0, populate custom fields (shouldn't happen with presets)
            // else if (offsetMs > 0) {
            //     daysInput.value = days;
            //     hoursInput.value = hours;
            //     minutesInput.value = minutes;
            // }
        }

    } else {
        removeReminderBtn.style.display = 'none';
    }

    updateReminderPreview();
    reminderModal.style.display = 'block';
}

async function displayNotificationsInModal() {
    const notificationListContainer = document.querySelector('.notification-list');
    const emptyState = notificationListContainer.querySelector('.empty-state');
    const currentUserId = currentUser.username;
    console.log("CurrentUserId is ", currentUserId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("I am inside displayNotificationsInModal function");
    console.log("CurrentUserId is ", currentUserId);

    notificationListContainer.innerHTML = '';

    const userNotifications = await dbStorageInstance.getNotificationsByUserId(currentUserId);
    console.log("UserNotifications are ", userNotifications);

    // Updated code with acknowledging the notifications.
    if (userNotifications && userNotifications.length > 0) {
        // Reversing the notifications array to show the latest notifications first.
        // const reversedNotifications = [...userNotifications].reverse();

        userNotifications.sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
            const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
            return dateB - dateA; // Sort newest first (descending)
        });

        userNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.classList.add('notification-item');
            notificationItem.id = `notification-${notification.taskId}`; // Use taskId

            // Add isAcknowledged class based on the property
            if (notification.isAcknowledged) {
                notificationItem.classList.add('read');
            }

            const iconDiv = document.createElement('div');
            iconDiv.classList.add('notification-icon');
            iconDiv.textContent = '📅';

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('notification-content');

            const titleDiv = document.createElement('div');
            titleDiv.classList.add('notification-title');
            const dueDate = new Date(notification.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate.getTime() === today.getTime()) {
                titleDiv.textContent = 'Task Due Today';
            } else if (dueDate < today) {
                titleDiv.textContent = 'Task Overdue';
            } else {
                titleDiv.textContent = 'Upcoming Task';
            }

            const messageDiv = document.createElement('div');
            messageDiv.classList.add('notification-message');
            const dueDateString = new Date(notification.dueDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            messageDiv.textContent = `Your task "${notification.taskName}" is due on ${new Date(notification.dueDate).toLocaleDateString()} at ${dueDateString}.`;

            const metaDiv = document.createElement('div');
            metaDiv.classList.add('notification-meta');

            const prioritySpan = document.createElement('span');
            prioritySpan.classList.add('priority-indicator');
            if (notification.priority) {
                prioritySpan.classList.add(notification.priority.toLowerCase());
                prioritySpan.innerHTML = `${getPriorityEmoji(notification.priority)} ${capitalize(notification.priority)}`;
            } else {
                prioritySpan.textContent = 'No Priority';
            }

            const timestampSpan = document.createElement('span');
            const notificationDate = new Date(notification.timestamp);
            timestampSpan.textContent = notificationDate.toLocaleString();

            metaDiv.appendChild(prioritySpan);
            metaDiv.appendChild(timestampSpan);

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(messageDiv);
            contentDiv.appendChild(metaDiv);

            notificationItem.appendChild(iconDiv);
            notificationItem.appendChild(contentDiv);

            notificationListContainer.appendChild(notificationItem);
        });
    } else {
        if (emptyState) {
            emptyState.style.display = 'block';
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('empty-state');
            emptyDiv.innerHTML = '<div>No Notifications yet</div><div>You\'ll see task reminders here when they\'re due.</div>';
            notificationListContainer.appendChild(emptyDiv);
        }
    }
}

const notificationListContainer = document.querySelector('.notification-list');

notificationListContainer.addEventListener('click', handleNotificationClick);

function highlightTask(taskId) {
    console.log("highlightTask called with taskId:", taskId);
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
        taskElement.classList.add('highlighted-task');
        console.log("Task element found and class added:", taskElement);
        // Optionally, remove the highlight after a duration
        setTimeout(() => {
            taskElement.classList.remove('highlighted-task');
        }, 6000); // Example: Remove after 3 seconds
    }
    else {
        console.log("Task element NOT found for taskId:", taskId);
    }
}

async function handleNotificationClick(event) {

    const clickedNotification = event.target.closest('.notification-item');

    if (clickedNotification) {
        const taskId = clickedNotification.id.replace('notification-', '');
        console.log('Clicked notification taskId:', taskId);

        // 1. Fetch the notification using getNotificationByTaskId
        const notification = await dbStorageInstance.getNotificationByTaskId(taskId);


        if (notification && !notification.isAcknowledged) {
            // 2. Update the isAcknowledged property
            const updatedNotification = { ...notification, isAcknowledged: true, isRead: true };
            await dbStorageInstance.updateNotification(updatedNotification);

            // 3. Visually update the clicked notification item
            clickedNotification.classList.add('read');

            // 4. (Optional) Navigate to the task and highlight it
            console.log("CurrentUser is ", currentUser);
            const clickedTask = currentUser.taskList.filter(task => task.task_id === taskId);
            console.log("Clicked task is ", clickedTask);
            const modalWrapper = document.querySelector('.notification-modal-wrapper');
            modalWrapper.style.display = 'none';
            let task = currentUser.taskList.find(task => task.task_id === taskId);
            focusTaskInUI(task);
            highlightTask(taskId);

            displayNotificationsInModal(); // Simplest: re-render the whole list
        }
    }
}

function notificationCenter() {
    const modalWrapper = document.querySelector('.notification-modal-wrapper');
    const openButton = document.querySelector('.notification-center-button');
    const closeButton = document.querySelector('.notification-modal-header .close-button');

    openButton.addEventListener('click', () => {
        modalWrapper.style.display = 'flex';
        displayNotificationsInModal();
    });

    closeButton.addEventListener('click', () => {
        modalWrapper.style.display = 'none';
    });

    modalWrapper.addEventListener('click', (e) => {
        if (e.target === modalWrapper) {
            modalWrapper.style.display = 'none';
        }
    });
}

function setupModalHandlers() {
    // Hiding and disabling all the things in background when task modal is open either for editing/adding task.
    showGlobalOverlay();

    // let modal = document.getElementById("task-modal");
    modal = document.getElementById("task-modal");
    const openButton = document.getElementById("open-task-modal");
    const closeButton = document.getElementById("close-modal");

    openButton.addEventListener("click", () => {
        document.getElementById("modal-title").textContent = "Add Task";
        clearModalForm();
        modal.style.display = "block";
        isEditMode = false;

    });

    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
        clearModalForm();
    });


    // Calling the handleTaskSubmit function to handle task editing and adding functionality.
    document.getElementById("task-form").addEventListener("submit", handleTaskSubmit);
    // *** Earlier version of code for task edit and task adding feature ***

    // After closing the task modal, things will again become accessible or enable.
    hideGlobalOverlay();

}

function applySearch(taskList, searchTerm) {
    if (!searchTerm) return taskList;
    const escapedInput = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedInput, "i");
    return taskList.filter(task =>
        regex.test(task.task) || regex.test(task.description)
    );
}

function setupSearch() {
    const searchInput = document.querySelector(".search-container input");

    // Clear the search input field
    const clearSearch = () => {
        if (searchInput) {
            searchInput.value = "";
            appState.searchTerm = "";
        }
    };

    // Function to handle search
    const handleSearch = _.debounce(() => {
        if (!searchInput) return;

        const inputValue = searchInput.value.trim();

        // Update app state with search term
        appState.searchTerm = inputValue;

        // Refresh the task display
        refreshTaskDisplay();
    }, 200);

    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);

    }

    // Return the clearSearch function to be used when switching views
    return { clearSearch };
}

// For refreshing the task display
function refreshTaskDisplay() {
    if (!currentUser || !currentUser.taskList) {
        console.error("No current user or task list available");
        return;
    }

    // Get sorted and filtered tasks
    const sortedAndFilteredTasks = sorting();

    // Display tasks with the current view mode
    if (sortedAndFilteredTasks.length === 0) {
        // Determine the appropriate message
        let message = "";
        if (appState.searchTerm) {
            message = "No tasks match your search.";
        } else if (Object.values(appState.activeFilters).some(filters => filters.length > 0)) {
            message = "No tasks match your filters.";
        } else {
            message = "No tasks available.";
        }

        displayTasks(currentUser, [], message, appState.currentView);
    } else {
        displayTasks(currentUser, sortedAndFilteredTasks, "", appState.currentView);
    }
}

// Function to reset filter UI elements
function resetFilterUI() {
    document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Clear app state filters
    appState.activeFilters = {
        status: [],
        priority: [],
        time: []
    };
}

function filterTasks(tasks, filterOptions = null) {

    // Use provided filter options or get from app state
    const filters = filterOptions || appState.activeFilters;

    return tasks.filter(task => {
        // Handle status filter
        const normalizedTaskStatus = (task.status || '').toLowerCase().trim();
        const normalizedStatusFilters = filters.status.map(status => status.toLowerCase().trim());
        const statusMatch = normalizedStatusFilters.length === 0 ||
            normalizedStatusFilters.includes(normalizedTaskStatus);

        // Handle priority filter
        const normalizedTaskPriority = (task.priority || '').toLowerCase().trim();
        const normalizedPriorityFilters = filters.priority.map(priority => priority.toLowerCase().trim());
        const priorityMatch = normalizedPriorityFilters.length === 0 ||
            normalizedPriorityFilters.includes(normalizedTaskPriority);

        // Handle time filter
        const timeMatch = filters.time.length === 0 ||
            filters.time.some(timeFilter => {
                // Special case for no due date
                if (timeFilter === '') {
                    return task.dueDate === null;
                }

                // *** If no due date, skip other time filters (below line of code is redundant as it will never match to other time filters and will say no tasks matching this filter, so working fine.) ***
                if (task.dueDate === null) return false;

                // Convert to Date object if it's a string
                let dateObj = task.dueDate;
                if (typeof task.dueDate === 'string') {
                    dateObj = new Date(task.dueDate);
                }

                // If date is invalid, return false
                if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return false;

                const today = new Date();
                const startOfWeek = new Date(today);
                // Below code is to get start of week as sunday
                // startOfWeek.setDate(today.getDate() - today.getDay());

                // Below code is to get start of week as Monday
                startOfWeek.setDate(today.getDate() + 1 - today.getDay());
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                switch (timeFilter) {
                    case 'overdue':
                        return dateObj < today;
                    case 'today':
                        return isToday(dateObj);
                    case 'this-week':
                        return isThisWeek(dateObj, startOfWeek);
                    case 'this-month':
                        return isThisMonth(dateObj, startOfMonth);
                    default:
                        return false;
                }
            });

        return statusMatch && priorityMatch && timeMatch;
    });
}

// Helper functions for date comparison

function isToday(date) {
    console.log("date is ", date);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isThisWeek(date, startOfWeek) {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week sunday as our week is starting from Monday.
    console.log("endOfWeek is ", endOfWeek);
    return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(date, startOfMonth) {
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    // console.log("endOfMonth is ", endOfMonth);
    // return date >= startOfMonth && date <= endOfMonth;

    console.log("Checking date: ", date, "startOfMonth: ", startOfMonth, "endOfMonth: ", endOfMonth);

    const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
    const normalizedStart = new Date(startOfMonth.setHours(0, 0, 0, 0));
    const normalizedEnd = new Date(endOfMonth.setHours(0, 0, 0, 0));
    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up filter panel events
    const appContainer = document.querySelector('.app-container');
    const filterPanel = document.querySelector('.filter-panel');
    const filterBtn = document.getElementById('open-filter-panel');
    const closeFilterBtn = document.getElementById('close-filter-panel');
    const clearFilterBtn = document.getElementById('clear-filters');

    // Function to handle panel opening.
    function openFilterPanel() {
        filterPanel.classList.add('active');
        appContainer.classList.add('filter-active');

        // Allow time for transition (need to know that does it mean, cancel the filter panel after 10 sec.)
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 10);
    }

    function closeFilterPanel() {
        filterPanel.classList.remove('active');
        appContainer.classList.remove('filter-active');
        document.removeEventListener('click', handleOutsideClick);
        // displayTasks(currentUser,currentUser.taskList);
        updateFilters();
    }

    // Handle clicks outside the panel
    function handleOutsideClick(e) {
        // If not clicking on anywhere inside filter panel
        if (!filterPanel.contains(e.target) &&
            // If not clicking on filter button
            !filterBtn.contains(e.target) &&
            // And if filter panel is active or open, then close it
            filterPanel.classList.contains('active')) {

            //  *** We will use closeFilterPanel over clicking the clearFitlerBtn because I want filterPanel to close but retain its filter settings/chosen options, and clearFilterBtn was suppose to clear Filter and then closing the filter panel, so we comment that out. ***
            // *** Note:- But doing this will creating an issue like when i switch to different user it is retaining that filter options, so better options will be really handling this by appStates. ***
            closeFilterPanel();

            // clearFilterBtn.click();
        }
    }

    // Clear filters button handler
    clearFilterBtn.addEventListener("click", () => {
        document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        updateFilters();
        closeFilterPanel();

    });
    // Updated code, now using checkboxes over radio buttons and multiselect for all the filters.

    // Adding event listener to the entire filter panel for handling checkbox selection
    filterBtn.addEventListener('click', openFilterPanel);
    closeFilterBtn.addEventListener('click', closeFilterPanel);

    filterPanel.addEventListener('change', (e) => {
        const checkbox = e.target.closest('input[type="checkbox"]');
        console.log("checkboxes are ", checkbox);
        if (checkbox) {
            updateFilters();
        }

        // if (e.target.type === 'checkbox') {
        //     updateFilters();
        // }
    });

    function updateFilters() {
        // Collect selected filters
        const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value) || [];
        const priorityFilters = Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(cb => cb.value) || [];
        const timeFilters = Array.from(document.querySelectorAll('input[name="time"]:checked')).map(cb => cb.value) || [];

        console.log('Active filters:', { status: statusFilters, priority: priorityFilters, time: timeFilters });

        console.log("currentUser taskList ", currentUser.taskList);

        // Instead of passing the filter options directly in the filterTasks function we are updating it in the appState.

        // const filteredTasks = filterTasks(currentUser.taskList, { status: statusFilters, priority: priorityFilters, time: timeFilters });
        // console.log("Filtered tasks is ", filteredTasks);

        appState.activeFilters = {
            status: statusFilters,
            priority: priorityFilters,
            time: timeFilters
        };

        // Apply sorting and filtering and update display (A function to update task display both card and list view when sorting or filtering.)
        refreshTaskDisplay();
    initializeApp();
});

// *** End of Filter related code/ functions ***

// *** Sorting functionality ***

// Updated sorting function
function sorting(forceSortBy = null) {
    console.log("I am inside sorting function, rockin...");

    // Use the provided sort option or get from app state
    const sortBy = forceSortBy || appState.currentSort;
    console.log('sortBy is ', sortBy);

    // Update the sort dropdown to reflect the current sort
    const sortDropdown = document.querySelector('.sort-container select');
    if (sortDropdown && sortDropdown.value !== sortBy) {
        sortDropdown.value = sortBy;
    }

    // Store the sort preference in app state
    appState.currentSort = sortBy;

    // Sort function code
    let sortFunc;
    switch (sortBy) {
        case "newestFirst":
            sortFunc = (taskA, taskB) => {
                console.log("taskA createdAt date is ", taskA.created_at);
                console.log("taskB createdAt date is ", taskB.created_at);
                // Defensive check for createdAt
                const dateA = taskA.created_at ? new Date(taskA.created_at) : new Date(0);
                const dateB = taskB.created_at ? new Date(taskB.created_at) : new Date(0);
                console.log("dateA inside newest first is ", dateA);
                console.log("dateB inside newest first is ", dateB);
                return dateB - dateA;
            };
            break;

        case "oldestFirst":
            sortFunc = (taskA, taskB) => {
                // Defensive check for created_at
                const dateA = taskA.created_at ? new Date(taskA.created_at) : new Date(0);
                const dateB = taskB.created_at ? new Date(taskB.created_at) : new Date(0);
                console.log("dateA inside oldest first is ", dateA);
                console.log("dateB inside oldest first is ", dateB);
                return dateA - dateB;
            };
            break;

        // ###################################################################################

        case "dueDateAsc":
            sortFunc = (taskA, taskB) => {
                if (!taskA.dueDate && !taskB.dueDate) return 0;
                if (!taskA.dueDate) return 1; // No due date last
                if (!taskB.dueDate) return -1;
                return new Date(taskA.dueDate) - new Date(taskB.dueDate);
            };
            break;
        
        case "dueDateDesc":
            sortFunc = (taskA, taskB) => {
                if (!taskA.dueDate && !taskB.dueDate) return 0;
                if (!taskA.dueDate) return 1; // No due date first
                if (!taskB.dueDate) return -1;
                return new Date(taskB.dueDate) - new Date(taskA.dueDate);
            };
            break;

        case "priority":
            sortFunc = (taskA, taskB) => {
                const priorityOrder = {
                    "high": 0,
                    "medium": 1,
                    "low": 2,
                    "": 3
                };
                const orderA = priorityOrder[taskA.priority || ""];
                const orderB = priorityOrder[taskB.priority || ""];
                return orderA - orderB;
            };
            break;

        case "status":
            sortFunc = (taskA, taskB) => {
                const statusOrder = {
                    "completed": 0,
                    "in progress": 1,
                    "not started": 2
                };

                const orderA = statusOrder[taskA.status || "not started"];
                const orderB = statusOrder[taskB.status || "not started"];
                return orderA - orderB;
            };
            break;

        default:
            // Default to newest first for unknown values
            sortFunc = (taskA, taskB) => {
                const dateA = taskA.created_at ? new Date(taskA.created_at) : new Date(0);
                const dateB = taskB.created_at ? new Date(taskB.created_at) : new Date(0);
                return dateB - dateA;
            };
    }

    // No need to run displayTasks here - this function just returns the sorted list
    // The calling function will handle displaying tasks
    if (!currentUser || !currentUser.taskList) {
        console.error("No current user or task list available");
        return [];
    }

    // Apply all active filters first
    let filteredList = filterTasks(currentUser.taskList, appState.activeFilters);

    // Apply search if there's a search term
    filteredList = applySearch(filteredList, appState.searchTerm);

    // Then sort the filtered list
    // return filteredList;
    return [...filteredList].sort(sortFunc);
}

// End of sorting function 

// Form submission handler

// Handling the default case of submitting the form by enter for both user and task form

document.addEventListener('DOMContentLoaded', function () {
    // Select both forms using their IDs
    const forms = document.querySelectorAll('#user-data , #task-form');

    forms.forEach(form => {
        form.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (event.target.tagName.toUpperCase() !== 'TEXTAREA') {
                    event.preventDefault();

                    const inputs = Array.from(form.querySelectorAll('input,select, textarea'));
                    const index = inputs.indexOf(event.target);
                    if (index > -1 && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                }
            }
        });

        // For handling calender not appear outside of the modal, on entering in the select and date time field without selecting any date and time.
        const dateInput = form.querySelector('#modal-dueDate');
        if (dateInput) {
            dateInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (document.querySelector('.flatpickr-calender.open')) {
                        const fp = dateInput._flatpickr;
                        if (fp) fp.close();
                    }
                }
            });
        }
    });
});

async function handleTaskSubmit(event) {
    event.preventDefault();
    const formData = handleModalFormData();

    const errors = FormValidator.validateTaskForm(formData);
    console.log("ERRORS OF TASK FROM IS ", errors);
    if (errors.length > 0) {
        showFormErrors(errors, 'task-form');
        return;
    }
    try {
        let user_task_ls = currentUser["taskList"];
        // Updating the task
        if (isEditMode && editTaskId) {
            // Better move, to check that the changed task name is not same as some other existing task.

            // For updates, check if the task name changes
            const otherTasks = currentUser.taskList.filter(task => task.task_id != editTaskId);
            const taskExists = otherTasks.some(task => task.task === formData.task);

            if (taskExists) {
                // alert("Task name already exists. Please choose a different name.")
                showFormErrors(['Task name already exists'], 'task-form');
                console.log("Task name already exists. i am inside taskExists of edit tasks");
                return;
            }
            if (currentUser.updateTask(editTaskId, formData)) {

                localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
                refreshTaskDisplay();
                showSuccess('Task updated successfully');
                modal.style.display = "none";
                const notification = await dbStorageInstance.getNotificationByTaskId(editTaskId);
                console.log("Notification to update is ", notification);

                console.log("We are updating the notification data now.");

                // Commenting out dueDate for now, because it might be affecting the reminder modal values. 
                // Now uncommenting it in order to maintain acid principles.

                notification.dueDate = formData.dueDate;

                notification.task = formData.task;
                notification.priority = formData.priority;
                // Updating the updatedAt field to the current date and time when updating the task.
                notification.updatedAt = new Date().toISOString();
                if (notification.isAcknowledged && notification.isRead) {
                    notification.isAcknowledged = false;
                    notification.isRead = false;
                }
                await dbStorageInstance.updateNotification(notification);
                console.log("Notification data updated successfully on updating the task to the database.");

                clearModalForm();

                // Task list
                let user_task_ls = currentUser["taskList"];
                // alert("Task updated successfully!");
                // showSuccess('Task updated successfully');
                console.log("Calling the sorting function when updating a task.");

            }

        }
        else {
            // Handle new task creation
            const existingTask = currentUser.taskList.find(task => task.task === formData.task);
            console.log("existingTask is, trying to check the add task function, it is not showing the error that task name already exists. ", existingTask);
            if (existingTask) {
                showFormErrors(['Task already exists'], 'task-form');
                // alert("Task already exists. Try adding another task!");
                return;
            }
            currentUser.addTasks(formData.task, formData.description, formData.status, formData.priority, formData.dueDate);
            localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
            refreshTaskDisplay();
            showSuccess('Task created successfully');

            // alert("Task created successfully!");
        }
        modal.style.display = "none";
        clearModalForm();
        console.log("Calling the sorting function when adding a new task.");
        refreshTaskDisplay();
    }
    catch (error) {
        showFormErrors([error.message], 'task-form');
    }

}

// ***  Now delete function is working without any issues, we don't need to attach anything to window anymore.***

function initializeDeletion() {
    deletionManagerInstance = new DeletionManager();
    // Initialize or setup checkboxes.
    deletionManagerInstance.setupTaskCheckboxes();

    // this is for making calling the change event on selecting last task,which was not happening before, basically event listener wasn't getting attached to last task,don't know why. -> IT MIGHT BE PREVIOUS ISSUE, NOW IT IS NOT HAPPENING EVEN WITHOUT BELOW CODE WE ARE ABLE TO DELETE THE LAST TASKS TOO.

    // Tested again and found that it is for making checkboxes visible and showing the select panel for deleting the tasks.
    // *** THIS CODE IS SPECIFICALLY FOR SHOWING THE SELECT PANEL FOR DELETING THE TASKS, IT HAVE NOTHING TO DO WITH LAST TASK SELECTION OR DELETION, SELECTION PANEL WASN'T SHOWING WITHOUT THIS CODE. ***
    document.querySelector("#task-display").addEventListener("change", (event) => {
        if (event.target.classList.contains("task-checkbox")) {
            deletionManagerInstance.handleCheckboxChange(event);
        }
    });

    // Add event listener to custom event(for our special case.)
    document.addEventListener("deleteTasks", async (event) => {
        // Using destructuring to get taskIds
        const { taskIds } = event.detail;
        console.log("Received taskIds in app.js: ", taskIds);

        if (taskIds && taskIds.size > 0) {
            // We can access deleteTask, it will work.
            const deletionSuccessful = currentUser.deleteTask(taskIds);

            if (deletionSuccessful) {

                console.log("Tasks deleted successfully.");
                localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));

                // Deleting the notification from the indexedDB
                for (const taskIdToDelete of taskIds) { // Iterate through all deleted taskIds
                    const notificationToDelete = await dbStorageInstance.getNotificationByTaskId(taskIdToDelete);
                    if (notificationToDelete) {
                        await dbStorageInstance.deleteNotification(notificationToDelete.id);
                        console.log(`Notification for taskId ${taskIdToDelete} deleted successfully from IndexedDB.`);
                    } else {
                        console.log(`No notification found for taskId ${taskIdToDelete} to delete.`);
                    }
                }

                // let user_task_ls = currentUser["taskList"];
                refreshTaskDisplay();
                // displayTasks(currentUser, user_task_ls);


                // Clear selection and hide modal directly
                deletionManagerInstance.clearSelectionState();
                document.getElementById("delete-modal").style.display = "none";
            }
        }
    });
}

navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data && event.data.command === 'focusTask' && event.data.taskId) {
        const taskId = event.data.taskId;
        console.log('Received focusTask command from service worker for taskId:', taskId);

        // 1.(Optional) Fetch notification if you need user info
        const notification = await dbStorageInstance.getNotificationByTaskId(taskId);
        let username;
        if (notification && notification.userId) {
            username = notification.userId;
        }

        if (username) {
            const targetUser = userList.find(user => user.username === username);

            if (targetUser) {
                console.log("Target user found: ", targetUser);

                // Simulate login for the target user
                currentUser = targetUser;
                initializeModules(currentUser);
                updateProfileView(currentUser);
                pageManager.showPage('profile');
                displayTasks(currentUser, currentUser.taskList);

                const task = currentUser.taskList.find(task => task.task_id === taskId);
                if (task) {
                    // focusTaskInUI(task);
                    // highlightTask(taskId);
                    setTimeout(() => {
                        focusTaskInUI(task);
                        highlightTask(taskId);
                    }, 200);
                }
                else {
                    console.log("Task not found for taskId: ", taskId);
                }

            }
            else {
                console.log("Target user not found for taskId: ", taskId, " and username is ", currentUser.username);
            }
        }

        const modalWrapper = document.querySelector('.notification-modal-wrapper');
        if (modalWrapper && modalWrapper.style.display !== 'none') {
            modalWrapper.style.display = 'none';
        }
        else {
            console.log('Task not found for taskId:', taskId);
            // Optionally handle the case where the task doesn't exist
        }
        // }
    }
});

function focusTaskInUI(task) {
    const taskElement = document.querySelector(`[data-task-id="${task.task_id}"]`);
    if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Basically updating the profile data after showing the profile page.
function updateProfileView(user) {
    const userProfile = document.querySelector("#user-profile");
    const appContainer = userProfile.querySelector(".app-container");
    const contentArea = appContainer.querySelector(".content-area");
    const greetUserContainer = contentArea.querySelector("#greet_user");

    greetUserContainer.innerHTML = '';
    const user_obj = document.createElement("h1");
    user_obj.textContent = `${getGreeting()}, ${user.name}!`;
    greetUserContainer.appendChild(user_obj);
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

function handleBackToHome() {
    pageManager.showPage('home');
    currentUser = null;
    // updateUserDropdown();
    populateUserList();
}

function setupEventListeners() {
    document.getElementById("submitBtn").addEventListener("click", (event) => {
        event.preventDefault();
        const { name, email } = handleFormSubmit();

        if (!name || !email) {
            alert("Please fill out all required fields.");
            return;
        }

        // Checking that user exists or not, if not then we will add one.
        if (!userMap.has(email)) {
            const newUser = new User(name, email);
            userMap.set(email, newUser);
            // 
            userList = Array.from(userMap.values());
            localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));

            populateUserList();
            alert("New user added successfully");

            document.getElementById("user-data").reset();
        }
        else {
            alert(`User with email ${email} already exists.`);
            document.getElementById("user-data").reset();
        }
    });
    
    document.getElementById("back-to-home").addEventListener("click", handleBackToHome);
}

function setupTaskOperationHandlers() {
   
    // Add event listeners to the sort dropdown
    const sortDropdown = document.querySelector('.sort-container select');
    if (sortDropdown) {
        // Remove any existing event listeners
        sortDropdown.removeEventListener('change', onSortChange);
        
        // Add our new event listener
        sortDropdown.addEventListener('change', onSortChange);
    }
}

// Handler for sort dropdown changes
function onSortChange(e) {
    // Update app state with the new sort preference
    appState.currentSort = e.target.value;
    
    // Refresh task display
    refreshTaskDisplay();
}

// Initialize the application
function initializeApp() {
    setupSearch();
    initViewToggle();

    setupTaskOperationHandlers()    
    // Initialize user list
    populateUserList();

    setupEventListeners();
    setupModalHandlers();
    setupUserModal();
    setupReminderModal();
    notificationCenter();
    initializeDeletion();

    pageManager.showPage('home');
}
