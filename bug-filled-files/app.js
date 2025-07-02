import {
    clearModalForm, handleFormSubmit, handleModalFormData, populateModalForm, showFormErrors, showSuccess, handleReminderFormData,
    clearReminderForm, updateReminderPreview, calculateReminderOffset
} from "./ui.js";
import { User } from "./data.js";
// import {User, StorageProxy } from "./data.js";
import { PageManager } from "./navigation.js";
import { FormValidator } from "./validation.js";
import { DeletionManager } from "./deletionManagement.js";
import { tagHandler, updateTaskCardTags } from "./tagManagement.js";
import { IndexedDBStorage } from "./indexedDB-storage.js";
import { NotificationManager } from "./notification-manager.js";


// let selectedDueDate = null;
// export { selectedDueDate };

// document.addEventListener('DOMContentLoaded', function () {
//     flatpickr("#modal-dueDate", {
//         enableTime: true,
//         dateFormat: "Y-m-d H:i",
//         altInput: true,
//         altFormat: "F j, Y h:i K",
//         minDate: "today",
//         defaultDate:new Date(), // Start with today for new tasks.
//         onChange: (selectedDates) => {
//             selectedDueDate = selectedDates[0];
//             console.log("Selected Date/Time:", selectedDueDate, selectedDueDate.toISOString());
//         }
//     });
// });


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
        time: [], // Array of active time filters
        tags: []
    },

    // Search state
    searchTerm: "", // Current search term

    // Current user
    currentUser: null, // Reference to current user object

    floatingButtons: {
        isEnabled: true,
        visible: {
            top: false,
            bottom: false
        }
    },

    pagination: {
        tasksPerPage: 10,
        currentPage: 1,
        isLoading: false,
        allTasksLoaded: false
    },

    temporaryTask: {
        taskId: null,
        isActive: false,
        addedAt: null // track when temporary task was added
    },

    // Reset all preferences when switching users
    resetForUserSwitch() {
        this.currentView = "card"; // Reset to card view
        this.currentSort = "newestFirst"; // Reset to default sort
        this.activeFilters = { status: [], priority: [], time: [] }; // Clear all filters
        this.searchTerm = ""; // Clear search term

        this.floatingButtons.visible = { top: false, bottom: false };

        cleanupTemporaryTask();

        // Tag filter modal cleanup on user switch
        selectedFilterTags = [];
        renderSelectedTags();
        tagFilterSearch.value = '';
        renderSuggestions('');
        renderTagFilterBar(); // Maybe we were not calling this last time, therefore tag filter bar was showing all the time.
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
const predefinedTags = [
    { value: uuidv4(), text: "Work" },
    { value: uuidv4(), text: "Personal" },
    { value: uuidv4(), text: "Urgent" }
];;
// Set for storing ids of selected tasks, to delete.
// const selectedTasks = new Set();


// SelectionBar (defining it globally because need access at multiple places)
// const selectionBar = document.querySelector('.selection-bar');

// *** code for selection manager
// let selectionManager = null; --> No more needed.
// const deletionManager = new DeletionManager();
// let deletionManager;
// deletionManager = new DeletionManager();
// deletionManager.setupTaskCheckboxes();

// document.addEventListener('DOMContentLoaded', () => {
//     deletionManager = new DeletionManager();
//     deletionManager.setupTaskCheckboxes();
// });


// For task editing and using it in displayTasks function, making this variables global

let isEditMode = false;
let editTaskId = null;
let modal = null;

// Load from local storage and populate the userMap
const storedUsers = JSON.parse(localStorage.getItem(userListKey)) || [];

storedUsers.forEach(userData => {
    const user = User.fromData(userData);
    userMap.set(user.email, user);

    // document.addEventListener('DOMContentLoaded', () => {
    //     displayTasks(user);
    // });
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


            // Update current user reference
            currentUser = userList[index];
            appState.currentUser = currentUser;
            // Reset app state for user switch
            appState.resetForUserSwitch();
            // Reset UI resetViewToggle states
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

            // Tag filter modal cleanup on user switch (tried but its not working, not doing cleanup)
            // *** We don't need it here as we are calling resetForUserSwitch ***
            // selectedFilterTags = [];
            // renderSelectedTags();
            // tagFilterSearch.value = '';
            // renderSuggestions('');

            // Initializing all the modules that use currentUser or injecting currenUser to the modules that depend on it.(Applying dependency injection design pattern.)
            // Call a function to initialize dependent modules
            initializeModules(currentUser);

            updateProfileView(currentUser);
            pageManager.showPage('profile');
            // const func = setupModalHandlers();
            // func.displayTasks(currentUser);

            // Display tasks with default settings
            refreshTaskDisplay();
            // initializeDeletion();
            deletionManagerInstance.clearSelectionState();
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
        // Initialize notifications
        // await notificationManagerInstance.init();
        // await notificationManagerInstance.init();

        // if (!notificationManagerInstance.serviceWorkerRegistration) {
        //     console.warn('Service worker not registered after initialization');
        // }

        // if (!notificationManagerInstance.hasPermission) {
        //     console.warn('Notification permission not granted after initialization');
        // }

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


    // deletionManagerInstance = new DeletionManager();
    // // Initialize or setup checkboxes.
    // deletionManagerInstance.setupTaskCheckboxes();

    // // this is for making calling the change event on selecting last task,which was not happening before, basically event listener wasn't getting attached to last task,don't know why.
    // document.querySelector("#task-display").addEventListener("change", (event) => {
    //     if (event.target.classList.contains("task-checkbox")) {
    //         deletionManagerInstance.handleCheckboxChange(event);
    //     }
    // });

    // // Add event listener to custom event(for our special case.)
    // document.addEventListener("deleteTasks", (event) => {
    //     // Using destructuring to get taskIds
    //     const { taskIds } = event.detail;
    //     console.log("Received taskIds in app.js: ", taskIds);

    //     if (taskIds && taskIds.size > 0) {
    //         // We can access deleteTask, it will work.
    //         const deletionSuccessful = currentUser.deleteTask(taskIds);

    //         if (deletionSuccessful) {

    //             console.log("Tasks deleted successfully.");
    //             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
    //             let user_task_ls = currentUser["taskList"];
    //             displayTasks(currentUser, user_task_ls);


    //             // Clear selection and hide modal directly
    //             deletionManagerInstance.clearSelectionState();
    //             document.getElementById("delete-modal").style.display = "none";
    //         }
    //     }
    // });
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

            cleanupTemporaryTask();
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
            resetPagination();
            // Refresh task display with new view mode
            refreshTaskDisplay();
            // initializeDeletion();

            deletionManagerInstance.clearSelectionState();

            // const deletioninstance = initializeDeletion();
            // deletioninstance.clearSelectionState();
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

// Creating a global variable, so that we can use customize taskList for different purposes, like sorting, view all tasks and showing few something like.
// let user_task_ls;
// let user_task_ls = currentUser["taskList"];

// *** No more need of user parameter as I am directly passing the current_task_ls based on needs. ***

// Making displayTasks function async because we are using await in calling checkExistingNotification for hasReminder variable.
// async function displayTasks(user, current_task_ls, message = "") {
//     // console.log("User is ", user.username);
//     // console.log("User is ", currentUser.username);
//     console.log("user_task_ls inside displayTasks func. ", current_task_ls);
//     console.log("I am inside displayTasks function. ");
//     const taskDisplay = document.querySelector("#task-display");
//     taskDisplay.innerHTML = '<div class="task-container"></div>';
//     const cardContainer = taskDisplay.querySelector('.task-container');
//     // Not updating it inside function.
//     // const user_task_ls = user["taskList"];
//     // USING "LET" OVER "CONST" BECAUSE DEFINING THIS VARIABLE AT MULTIPLE PLACES.
//     let user_task_ls = current_task_ls;
//     // if(sorting){
//     //     // Then use sorting userList.
//     //     // user_task_ls = 
//     // }



//     // const tagModal = document.getElementById('tag-modal');

//     // const openTagModal = document.querySelector('.tag-button');
//     // const closeTagModal = document.getElementById('close-tag-modal');

//     // closeTagModal.addEventListener("click", () => {
//     //     tagModal.style.display = "none";
//     // });

//     console.log("got the message: ", message);

//     // if (message) {
//     //     // cardContainer.innerHTML = `<p class="no-tasks-message">${message}</p>`
//     //     // taskCard.innerHTML = `<p class="no-tasks-message">${message}</p> `;
//     // }

//     if (message) {
//         cardContainer.innerHTML = `<div class="no-tasks-container"><p class="no-tasks-message">${message}</p></div>`;
//     }

//     else {
//         // *** Creating the task card ***

//         for (const task of user_task_ls) {
//             const taskCard = document.createElement("div");
//             taskCard.className = "task-card";
//             taskCard.dataset.taskId = task.task_id;
//             // Adding the task id in this manner to highlight the task when notification is clicked.
//             taskCard.id = `task-${task.task_id}`;
//             // Convert the task's due date to a formatted string
//             const dueDate = new Date(task.dueDate);
//             // Defined in tooltip function because now using there.
//             const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
//             const hasReminder = await checkExistingNotification(task.task_id);
//             console.log("hasReminder is ", hasReminder);
//             // taskCard.innerHTML = `
//             //     <div class="card-header">
//             //         <h3 class="task-title">${task.task}</h3>
//             //         <div class="status-priority>
//             //             <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
//             //             <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
//             //                 <span>${getPriorityEmoji(task.priority)}</span>
//             //                 <span>${capitalize(task.priority)}</span>
//             //             </div>
//             //         </div>
//             //     </div>

//             //     <!-- For showing added tags later on(basically future add-ons) -->

//             //     <!-- Container for showing tag modal when clicking on add tag button  -->
//             //     <div class="tags-container">
//             //     </div>

//             //     <div class="card-footer">
//             //         <button class="tag-button" data-task-id ="${task.task_id}">
//             //             <span class="tag-icon">+</span>
//             //             <span>Add Tag</span>
//             //         </button>
//             //         <button class="reminder-btn" title="${formattedDate}" date-has-reminder="true">
//             //             <span>🔔</span>
//             //         </button>
//             //     </div> `;

//             // Determine if the reminder is active (due date is in the future.)
//             // ??? No more needed, handling with hasReminder variable which is actually checking in indexedDB over depending on bell state only. ???, don't know why bell state can't work as a whole.
//             // const isActive = dueDate > new Date(); 

//             // Dynamically creating the bell icon HTML with appropriate state (for adding in task card, which is also dynamically created.)
//             const bellButtonHTML = `
//                 <button class="reminder-button" id="reminder-btn-${task.task_id}" data-task-id="${task.task_id}" data-reminder-set="${hasReminder}">
//                     ${getBellIconHTML(hasReminder, task.dueDate)}
//                 </button>`;

//             // <button class="reminder-button" id="reminder-btn-${task.task_id}" data-task-id="${task.task_id}" ${task.dueDate ? 'data-reminder="active"' : ''}>
//             //     <span class="bell-icon">
//             // <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//             //     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//             //     <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//             // </svg>
//             //     </span>
//             //     <div class="reminder-tooltip">${task.dueDate ? 'Set reminder (' + formattedDate + ')' : 'Set date and time'}</div>
//             // </button>`;

//             taskCard.innerHTML = `
//                 <div class="task-selection">
//                     <div class="task-checkbox-wrapper">
//                         <input type="checkbox" class="task-checkbox" data-task-id="${task.task_id}">
//                         <div class="checkbox-custom"></div>
//                     </div>
//                     <i class="material-icons delete-icon" data-task-id="${task.task_id}">delete</i>
//                 </div>

//                 <div class="card-header">
//                     <h3 class="task-title">${task.task}</h3>
//                     <div class="status-priority">
//                         <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
//                         <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
//                             <span>${getPriorityEmoji(task.priority)}</span>
//                             <span>${capitalize(task.priority)}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div class="tags-container"> </div>


//                 <div class="card-footer">

//                     <button class="tag-button" id="tag-btn-${task.task_id}" data-task-id="${task.task_id}">
//                         <span>Add Tag</span>
//                     </button>

//                      ${bellButtonHTML}
//                 </div> `;

//             // <button class="reminder-button" id="reminder-btn-${task.task_id}" data-task-id="${task.task_id}" title="${formattedDate}" date-has-reminder="true">
//             //     <span>🔔</span>
//             // </button>

//             //*** Clearing tags from all the tasks in one go ***

//             // task.tagsSet.clear();
//             // user.customTags.clear();
//             // localStorage.setItem(userListKey, JSON.stringify(
//             //     Array.from(userMap.values()).map(user => user.toData())
//             // ));
//             cardContainer.appendChild(taskCard);
//             // updateTaskCardTags(task);
//             updateTaskCardTags(task, userListKey, userMap);

//             // Just clearing customTags from sudhanshu user, for testing or for proper data.
//             //*** For clearing individual task tagsSet. ***
//             // task.tagsSet.clear();
//             // user.customTags.clear();

//             // localStorage.setItem(userListKey, JSON.stringify(
//             //     Array.from(userMap.values()).map(user => user.toData())
//             // ));



//             // console.log("customTags are ", customTags);

//             // id="reminder-btn-${task.task_id}"
//             // ******************************************
//             /* <button class="tag-button" id="tag-btn" data-task-id="${task.task_id}" */
//             // deletionManager = new DeletionManager();
//             // deletionManager.setupTaskCheckboxes();
//             // *******************************************************
//             // // Selecting all the checkboxes
//             // const checkboxes = document.querySelectorAll('.task-checkbox');
//             // checkboxes.forEach(checkbox => {
//             //     checkbox.addEventListener('change',function() {
//             //         const taskId = this.dataset.task_id;
//             //         if (this.checked) {
//             //             selectedTasks.add(taskId);
//             //         }
//             //         else {
//             //             // Set does nothing if taskId not exist in set.
//             //             // if (selectedTasks.has(taskId)){
//             //                 selectedTasks.delete(taskId);
//             //             // }
//             //         }

//             //         // Update selection bar visibility and counter
//             //         const selectionBar = document.querySelector('.selection-bar');
//             //         // Basically means, if any task is selected.
//             //         if (selectedTasks.size > 0) {
//             //             selectionBar.style.display = 'flex';
//             //             selectionBar.querySelector('.selected-count').textContent = 
//             //             `${selectedTasks.size} selected`;
//             //         }
//             //         else {
//             //             selectionBar.style.display = 'none';
//             //         }
//             //     });
//             // });

//             // *************************************

//             // taskCard.querySelector('.tag-button').dataset.taskid = task.task_id;
//             // Add click handler for editing(i.e. allow to edit only if it is not click at any button like add tag, notify or tags chip itself.)
//             // taskCard.addEventListener("click", (e) => {
//             //     console.log("e.target is ", e.target);

//             //     if(e.target.matches('.tag-button') || e.target.closest('.tag-button') ){
//             //         e.stopPropagation();
//             //         // const button = e.target.matches('.tag-button') ? e.target: e.target.closest('tag-button');
//             //         const taskId = task.task_id;
//             //         console.log("tag button clicked for task: ", taskId);
//             //         tagModal.dataset.taskid = taskId;
//             //         tagModal.style.display = 'block';
//             //         tagHandler(user, predefinedTags, tagModal);
//             //         return;
//             //     }

//             //     if (e.target.matches('.reminder-button') || e.target.closest('.reminder-button')){
//             //         e.stopPropagation();
//             //         console.log("Reminder button clicked for task: ", task.task_id);
//             //         return;
//             //     }

//             //     if (e.target.matches('.task-checkbox') || e.target.matches('.delete-icon')){
//             //         console.log("Checkbox ro delete icon clicked");
//             //         return;
//             //     }

//             //     console.log("Task card clicked, opening edit modal");
//             //     document.getElementById("modal-title").textContent = "Update Task";
//             //     isEditMode = true;
//             //     editTaskId = task.task_id;
//             //     populateModalForm(task);
//             //     modal.style.display = "block";
//             // });

//             //         const tagButton = taskCard.querySelector('.tag-button');
//             //         const reminderButton = taskCard.querySelector('.reminder-button');
//             //         // const tagButton = document.getElementById("tag-btn-${task.task_id}");
//             //         // const reminderButton = document.getElementById("reminder-btn-");

//             //         console.log("tagButton is ", tagButton);
//             //         console.log('reminderButton is ', reminderButton);


//             //         tagButton.addEventListener('click', (e) => {
//             //             console.log("tagButton is ", tagButton);
//             //             e.stopPropagation();
//             //             const taskId = task.task_id;
//             //             console.log("Tag button clicked for task:", taskId);
//             //             tagModal.dataset.taskid = taskId;
//             //             tagModal.style.display = 'block';
//             //             tagHandler(user,predefinedTags,tagModal);
//             //         });

//             //         reminderButton.addEventListener('click', (e) => {
//             //             e.stopPropagation();
//             //             console.log("Reminder button clicked for task:", task.task_id);
//             //         });

//             //         taskCard.addEventListener("click", (e) => {

//             //             // Check if the click is on a checkbox or delete icon
//             //             if (e.target.matches('.task-checkbox') ||
//             //                 e.target.closest('.task-checkbox') ||
//             //                 e.target.matches(".delete-icon") ||
//             //                 e.target.closest(".delete-icon")){
//             //             return;
//             //         }

//             //         console.log("Task card clicked, opening edit modal");
//             //         document.getElementById("modal-title").textContent = "Update Task";
//             //         isEditMode = true;
//             //         editTaskId = task.task_id;
//             //         populateModalForm(task);
//             //         modal.style.display = "block";
//             //         });

//         }

//     }

//     // *** NOTE:- Need to add this code inside displayTasks function because we are dynamically creating this elements, so can't be found outside of this, in order to do anything with them, we have to do it here(where creation is happening.) ***
//     // Code for not allowing delete icon and checkbox to show when hover or working with tag chip, reminder button or add tab button.

//     document.querySelectorAll('.tag-button, .reminder-button, .task-tag').forEach(element => {
//         element.addEventListener('mouseenter', function () {
//             // Find the parent task card
//             const taskCard = this.closest('.task-card');
//             if (taskCard) {
//                 // Add a class to indicate an interactive element is being hovered
//                 taskCard.classList.add('interactive-hover');
//             }
//         });

//         element.addEventListener('mouseleave', function () {
//             // Find the parent task card
//             const taskCard = this.closest('.task-card');
//             if (taskCard) {
//                 // Remove the class when hover ends
//                 taskCard.classList.remove('interactive-hover');
//             }
//         });
//     });

//     function handleTaskDisplayClick(event) {

//         // More detailed checks for tag button

//         if (!event.target.closest('.task-card')) return;

//         if (event.target.matches('.tag-button') || event.target.closest('.tag-button')) {

//             console.log("user is ", userList.find(user => user.username === "marshian2511"));

//             const predefinedTags = [
//                 { value: uuidv4(), text: "Work" },
//                 { value: uuidv4(), text: "Personal" },
//                 { value: uuidv4(), text: "Urgent" }
//             ];

//             event.stopPropagation();
//             const taskCard = event.target.closest('.task-card');
//             const taskId = taskCard.dataset.taskId;
//             console.log("Tag button clicked for task: ", taskId);
//             const tagModal = document.getElementById('tag-modal');
//             tagModal.dataset.taskid = taskId;
//             tagModal.style.display = 'block';

//             tagHandler(userListKey, userMap, currentUser, predefinedTags, tagModal);
//             return;
//         }

//         // Handle reminder button clicks

//         // if (event.target.matches('.reminder-button') || event.target.closest('.reminder-button')) {
//         //     event.stopPropagation();
//         //     const reminderButton = event.target.closest('.reminder-button');
//         //     const taskId = event.target.closest('.task-card').dataset.taskId;
//         //     console.log("Reminder button clicked for task: ", taskId);

//         //     // Toggle the UI state for the reminder button
//         //     reminderButton.classList.toggle('setting-reminder');

//         //     // Update the bell icon based on state
//         //     const bellIcon = reminderButton.querySelector('.bell-icon');
//         //     if (reminderButton.classList.contains('setting-reminder')) {
//         //         // Change to bell with sound waves
//         //         bellIcon.innerHTML = `
//         // <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         //     <path d="M2 8c0-2.2.7-4.3 2-6" stroke="currentColor" stroke-width="2"></path>
//         //     <path d="M22 8a10 10 0 0 0-2-6" stroke="currentColor" stroke-width="2"></path>
//         // </svg>
//         //     `;

//         //         // Hide tooltip when reminder/notification is set.
//         //         const tooltip = reminderButton.querySelector('.reminder-tooltip');
//         //         if (tooltip) tooltip.style.display = 'none';
//         //     }

//         //     else {
//         //         // Revert to original or default bell when either no date and time is set, or date and time is set.
//         //         // const isActive = reminderButton.hasAttribute('data-reminder') && 
//         //         //                  reminderButton.getAttribute('data-reminder') ==="active";

//         //         // bellIcon.innerHTML = `
//         //         //     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         //         //         <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//         //         //         <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//         //         //     </svg>`;

//         //         bellIcon.innerHTML = `
//         //         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         //             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//         //             <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//         //         </svg>
//         //     `;

//         //         // Show tooltip again
//         //         const tooltip = reminderButton.querySelector('.reminder-tooltip');
//         //         if (tooltip) tooltip.style.display = '';
//         //     }

//         //     return;
//         // }

//         // Updated code for reminder button.
//         if (event.target.matches('.reminder-button') || event.target.closest('.reminder-button')) {
//             event.stopPropagation();
//             const taskId = event.target.closest('.task-card').dataset.taskId;
//             const task = currentUser.taskList.find(t => t.task_id === taskId);

//             // This is redundant, because modal won't open if there is no due date. (It will open for set date and time.)
//             // if (!task.dueDate) {
//             //     showFormErrors(['Please set a due date for the task first'], 'task-form');
//             //     return;
//             // }

//             // ### Previous code when there is no reminder remove button. ###

//             // const reminderModal = document.getElementById('reminder-modal');
//             // reminderModal.style.display = 'block';
//             // clearReminderForm(); // Clear any previous selections

//             // We need to explicitly check that whether the task have reminder or not, here using button click.

//             // Don't show reminder modal if there is no due date.
//             if (!task.dueDate) {
//                 return;
//             }
//             currentReminderTaskId = taskId;
//             showReminderModal(taskId);
//             // *** It is wrong approach because it will add call the event lsitener every time the button is get clicked.
//             // // Adding event listener for set reminder button.
//             // const setReminderBtn = document.getElementById('set-reminder-btn');
//             // setReminderBtn.addEventListener(() => {
//             //     console.log("setReminderBtn is ", setReminderBtn);
//             //     reminderButton.classList.add('setting-reminder');
//             //     reminderButton.innerHTML = getBellIconHTML(true, task.dueDate);

//             const setReminderBtn = document.getElementById('set-reminder-btn');
//             if (setReminderBtn) {
//                 // Remove any existing listeners to avoid duplicates
//                 setReminderBtn.removeEventListener('click', handleSetReminderButtonClick);
//                 // Add the listener
//                 setReminderBtn.addEventListener('click', handleSetReminderButtonClick);
//             }
//             // });
//             return;
//         }

//         // If it's a task card but not a button
//         if (event.target.closest('.task-card') &&
//             !event.target.matches('.task-checkbox') &&
//             !event.target.closest('.task-checkbox') &&
//             !event.target.matches('.delete-icon') &&
//             !event.target.closest('.delete-icon')) {

//             const taskCard = event.target.closest('.task-card');
//             console.log("taskCard is ", taskCard);
//             const taskId = taskCard.dataset.taskId;
//             console.log("Task card clicked, opening edit modal", taskId);
//             document.getElementById("modal-title").textContent = "Update Task";
//             isEditMode = true;
//             editTaskId = taskId;


//             // *** Here because of rapid switching between users and then immediate action of trying to update the task, causing task not found, or its properties not found error. ***

//             // Finding the task object
//             // const task = current_task_ls.find(t => t.task_id === taskId);
//             // console.log("task is ", task);
//             // populateModalForm(task);
//             // modal.style.display = "block";
//             const storedUsers = localStorage.getItem(userListKey);
//             if (storedUsers) {
//                 const usersArray = JSON.parse(storedUsers);
//                 const currentUserData = usersArray.find(u => u.username === currentUser.username);
//                 if (currentUserData && currentUserData.taskList) {
//                     const task = currentUserData.taskList.find(t => t.task_id === taskId);
//                     console.log("Task for edit (user switch):", task);
//                     populateModalForm(task);
//                     modal.style.display = "block";
//                 } else {
//                     console.error("Error: Could not find current user or their tasks.");
//                 }
//             } else {
//                 console.error("Error: Could not retrieve user list.");
//             }

//         }
//     }

//     // Add a single event listener to handle all task card interactions.
//     taskDisplay.removeEventListener("click", handleTaskDisplayClick);
//     taskDisplay.addEventListener("click", handleTaskDisplayClick);

// }

// **********************************************************
function getBatchTasks(tasks, options = {}) {
    const {
        currentPage = appState.pagination.currentPage,
        isNextBatch = false,
        fromStart = false
    } = options;

    const tasksPerPage = appState.pagination.tasksPerPage;

    if (!isNextBatch) {
        const start = fromStart ? 0 : (currentPage - 1) * tasksPerPage;
        const end = currentPage * tasksPerPage;
        return {
            tasks: tasks.slice(start, end),
            start,
            end,
            isLastBatch: end >= tasks.length
        };
    }

    const start = currentPage * tasksPerPage;
    const end = (currentPage + 1) * tasksPerPage;
    return {
        tasks: tasks.slice(start, end),
        start,
        end,
        isLastBatch: end >= tasks.length
    };
}


// #################################################################################################
// A version of displayTasks including list view mode.

async function displayTasks(user, current_task_ls, message = "", viewMode = "card", focusedTaskId = null) {
    console.log("user_task_ls inside displayTasks func. ", current_task_ls);
    console.log("I am inside displayTasks function. View mode: ", viewMode);
    const taskDisplay = document.querySelector("#task-display");

    // Clear existing floating buttons if any
    const existingButtons = taskDisplay.querySelectorAll('.jump-button');
    existingButtons.forEach(button => button.remove());

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

    // Calculate current batch of tasks
    // const startIndex = 0;
    // const endIndex = appState.pagination.tasksPerPage * appState.pagination.currentPage;
    // const tasksToDisplay = user_task_ls.slice(startIndex, endIndex);

    // Updated logic for adding a temporary task when clicked in list view for highlighting
    // Calculate current batch of tasks

    // *************************************************************************************************
    // const startIndex = 0;
    // const endIndex = appState.pagination.tasksPerPage * appState.pagination.currentPage;
    // let tasksToDisplay = user_task_ls.slice(startIndex, endIndex);

    // // Add temporary task if focusedTaskId is not in the current batch (card view only)
    // if (
    //     viewMode === "card" &&
    //     focusedTaskId &&
    //     !tasksToDisplay.some(task => task.task_id === focusedTaskId)
    // ) {
    //     // Find the task in the whole list
    //     const tempTask = user_task_ls.find(task => task.task_id === focusedTaskId);
    //     if (tempTask) {
    //         tasksToDisplay = [...tasksToDisplay, tempTask];
    //     }
    // }

    // console.log("Tasks to display are ", tasksToDisplay);

    // // ************************************************************************************************
    // // Check if all tasks are loaded
    // appState.pagination.allTasksLoaded = endIndex >= user_task_ls.length;

    // *** fromStart: true implies start from zero. ***
    // const { tasks: tasksToDisplay, isLastBatch } = getBatchTasks(user_task_ls, { fromStart: true });
    // appState.pagination.allTasksLoaded = isLastBatch;

    // Calculate current batch of tasks    
    const startIndex = 0;
    let endIndex;

    // If we have a temporary task, show one extra task
    if (appState.temporaryTask.isActive && viewMode === "card") {
        endIndex = (appState.pagination.tasksPerPage * appState.pagination.currentPage) + 1;
    } else {
        endIndex = appState.pagination.tasksPerPage * appState.pagination.currentPage;
    }

    const tasksToDisplay = user_task_ls.slice(startIndex, endIndex);

    // Check if all tasks are loaded (adjust for temporary task)
    const actualTaskCount = appState.temporaryTask.isActive ? user_task_ls.length - 1 : user_task_ls.length;
    appState.pagination.allTasksLoaded = (appState.pagination.tasksPerPage * appState.pagination.currentPage) >= actualTaskCount;

    // Clear the display area based on the view mode
    if (viewMode === "card") {

        // Card View With Load More Button (Only clear and set up DOM if first page render)
        if (appState.pagination.currentPage === 1 || appState.temporaryTask.isActive) {
            // Clear the display area first
            taskDisplay.innerHTML = "";

            taskDisplay.innerHTML = `
            <div class="task-container"></div>
            <div class="load-more-container"> 
                    <button class="load-more-button" ${appState.pagination.allTasksLoaded ? 'disabled' : ''}>
                        Load More Tasks
                    </button>
                    <div class="loading-spinner">
                        <span class="material-icons">autorenew</span>
                    </div>    
            </div>`;
        }


        const cardContainer = taskDisplay.querySelector('.task-container');
        const loadMoreBtn = taskDisplay.querySelector('.load-more-button');
        const loadingSpinner = taskDisplay.querySelector('.loading-spinner');

        // Setup floating buttons for card view
        setupFloatingButtonsScrollHandler("card");

        // Render task cards
        for (const task of tasksToDisplay) {
            // for (const task of user_task_ls) {
            const taskCard = document.createElement("div");
            taskCard.className = "task-card";
            taskCard.dataset.taskId = task.task_id;
            taskCard.id = `task-${task.task_id}`;

            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
            const hasReminder = await checkExistingNotification(task.task_id);
            console.log("hasReminder is ", hasReminder);

            const bellState = await getBellState(task);
            // const bellButtonHTML = `
            //     <button class="reminder-button" id="reminder-btn-${task.task_id}" data-task-id="${task.task_id}" data-reminder-set="${hasReminder}">
            //         ${getBellIconHTML(hasReminder, task.dueDate)}
            //     </button>`;

            const bellButtonHTML = `
                <button class="reminder-button bell-${bellState}"
                        data-task-id="${task.task_id}"
                        data-bell-state="${bellState}">
                    ${getBellIconHTML(bellState, task.dueDate)}
                </button>
                `;

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

            // // If this is the focused task, highlight it
            // if (focusedTaskId && task.task_id === focusedTaskId) {
            //     setTimeout(() => {
            //         focusTaskInUI(task);
            //         highlightTask(focusedTaskId);
            //     }, 200); // Delay to ensure DOM is updated
            // }
        }

        console.log("focusedTaskId is ", focusedTaskId);
        const focusedTask = current_task_ls.find(task => task.task_id === focusedTaskId);
        if (focusedTask) {
            console.log("focusedTask is ", focusedTask.task);
        }
        else {
            console.log("No focused task found.");
        }

        // If this is the focused task, highlight it
        if (focusedTaskId && focusedTask.task_id === focusedTaskId) {
            setTimeout(() => {
                focusTaskInUI(focusedTask);
                highlightTask(focusedTaskId);
            }, 200); // Delay to ensure DOM is updated
        }

        // Setup Load More button
        if (loadMoreBtn) {
            loadMoreBtn.style.display = appState.pagination.allTasksLoaded ? 'none' : 'block';
            // Remove existing listener if any
            loadMoreBtn.replaceWith(loadMoreBtn.cloneNode(true));

            // Add new listener
            taskDisplay.querySelector('.load-more-button').addEventListener('click', async () => {
                if (!appState.pagination.isLoading && !appState.pagination.allTasksLoaded) {
                    appState.pagination.isLoading = true;
                    loadMoreBtn.disabled = true;
                    loadingSpinner.classList.add('visible');

                    // Simulate loading delay (remove in production)
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Check if temporary task should be removed
                    await handleTemporaryTaskOnLoadMore();

                    appState.pagination.currentPage++;
                    refreshTaskDisplay();

                    appState.pagination.isLoading = false;
                    loadMoreBtn.disabled = false;
                    loadingSpinner.classList.remove('visible');
                }
            });
        }
        // If this is the focused task, highlight it
        // if (focusedTaskId && task.task_id === focusedTaskId) {
        //     setTimeout(() => {
        //         focusTaskInUI(task);
        //         highlightTask(focusedTaskId);
        //     }, 200); // Delay to ensure DOM is updated
        // }
    }

    // ----- LIST VIEW -----
    else {

        // Only clear and set up DOM if first page render
        if (appState.pagination.currentPage === 1) {

            // Clear the display area first
            taskDisplay.innerHTML = "";

            // Initial render
            taskDisplay.innerHTML = `
                <div class="task-list-container"></div>
                <div class="loading-spinner">
                    <span class="material-icons">autorenew</span>
                </div>`;
        }
        // LIST VIEW - new implementation

        const listContainer = taskDisplay.querySelector('.task-list-container');
        const loadingSpinner = taskDisplay.querySelector('.loading-spinner');

        // // Add floating buttons
        // const buttonsHTML = `
        //     <button id="jump-to-top-btn" class="jump-button jump-to-top" aria-label="Jump to top of task list">
        //         <span class="material-icons">arrow_upward</span>
        //     </button>
        //     <button id="jump-to-bottom-btn" class="jump-button jump-to-bottom" aria-label="Jump to bottom of task list">
        //         <span class="material-icons">arrow_downward</span>
        //     </button>
        // `;
        // taskDisplay.insertAdjacentHTML('beforeend', buttonsHTML);

        // // Initialize floating buttons
        // setupFloatingButtonsScrollHandler();

        // **** Using same jump buttons for both list and card view by creating the buttons at one place ***
        // Setup floating buttons for list view
        setupFloatingButtonsScrollHandler("list");

        // Render each task as a list item

        // for (const task of user_task_ls) {
        //     const taskListItem = document.createElement("div");
        //     taskListItem.className = "task-list-item";
        //     taskListItem.dataset.taskId = task.task_id;
        //     taskListItem.id = `task-list-${task.task_id}`;

        //     const dueDate = new Date(task.dueDate);
        //     const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();

        //     // Making sure checkbox and delete icon structure matches card view
        //     taskListItem.innerHTML = `
        //         <div class="task-selection">
        //             <div class="task-checkbox-wrapper">
        //                 <input type="checkbox" class="task-checkbox" data-task-id="${task.task_id}">
        //                 <div class="checkbox-custom"></div>
        //             </div>
        //             <i class="material-icons delete-icon" data-task-id="${task.task_id}">delete</i>
        //         </div>
        //         <div class="list-item-content" data-task-id="${task.task_id}">
        //             <div class="list-item-main">
        //                 <span class="list-item-title">${task.task}</span>
        //                 <div class="list-item-indicators">
        //                     <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
        //                     <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
        //                         <span>${getPriorityEmoji(task.priority)}</span>
        //                         <span>${capitalize(task.priority)}</span>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div class="list-item-details">
        //                 <span class="list-item-date">${formattedDate}</span>
        //             </div>
        //         </div>
        //     `;

        //     listContainer.appendChild(taskListItem);

        //     // Debug logging
        //     console.log("Buttons created:", {
        //         topButton: document.getElementById('jump-to-top-btn'),
        //         bottomButton: document.getElementById('jump-to-bottom-btn'),
        //         container: taskDisplay,
        //         scrollHeight: taskDisplay.scrollHeight,
        //         clientHeight: taskDisplay.clientHeight
        //     });
        // }

        tasksToDisplay.forEach(task => {
            if (!document.querySelector(`[data-task-id="${task.task_id}"]`)) {
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

                // Debug logging
                console.log("Buttons created:", {
                    topButton: document.getElementById('jump-to-top-btn'),
                    bottomButton: document.getElementById('jump-to-bottom-btn'),
                    container: taskDisplay,
                    scrollHeight: taskDisplay.scrollHeight,
                    clientHeight: taskDisplay.clientHeight
                });
            }
        });

        // Setup Infinite Scroll
        const observer = new IntersectionObserver(
            async ([entry]) => {
                if (entry.isIntersecting &&
                    !appState.pagination.isLoading &&
                    !appState.pagination.allTasksLoaded) {
                    appState.pagination.isLoading = true;
                    loadingSpinner.classList.add('visible');

                    // Simulate loading delay 
                    await new Promise(resolve => setTimeout(resolve, 300));

                    appState.pagination.currentPage++;
                    refreshTaskDisplay();

                    appState.pagination.isLoading = false;
                    loadingSpinner.classList.remove('visible');
                }
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 0.1
            }
        );

        // Observe the loading spinner
        observer.observe(loadingSpinner);

    }

    // // Update any existing task cards that need focus
    // if (focusedTaskId ) {
    //     setTimeout(() => {
    //         focusTaskInUI(task);
    //         highlightTask(focusedTaskId);
    //     }, 200);
    // }    

    // Set up shared event listeners for both views
    // document.querySelectorAll('.tag-button, .reminder-button, .task-tag').forEach(element => {
    //     element.addEventListener('mouseenter', function () {
    //         const taskCard = this.closest('.task-card');
    //         const taskListItem = this.closest('.task-list-item'); // Fixed variable name
    //         if (taskCard) {
    //             console.log('adding interactive hover to task card');
    //             taskCard.classList.add('interactive-hover');
    //         }
    //         else if (taskListItem) { // Fixed variable name
    //             taskListItem.classList.add('interactive-hover');
    //             console.log("adding interactive hover to task list.");
    //         }
    //     });
    //     element.addEventListener('mouseleave', function () {
    //         const taskCard = this.closest('.task-card');
    //         const taskListItem = this.closest('.task-list-item'); // Fixed variable name
    //         if (taskCard) {
    //             console.log("removing interactive hover from tsk card.");
    //             taskCard.classList.remove('interactive-hover');
    //         }
    //         else if (taskListItem) { // Fixed variable name
    //             console.log("removing interactive hover from task list.");
    //             taskListItem.classList.remove('interactive-hover');
    //         }
    //     });
    // });

    // Set up interactive-hover event listeners only for card view because it only have interactive elements
    // if (viewMode === "card") {
    //     document.querySelectorAll('.tag-button, .reminder-button, .task-tag').forEach(element => {
    //         element.addEventListener('mouseenter', function () {
    //             const taskCard = this.closest('.task-card');
    //             if (taskCard) {
    //                 console.log('Adding interactive-hover to task card');
    //                 taskCard.classList.add('interactive-hover');
    //             }
    //         });
    //         element.addEventListener('mouseleave', function () {
    //             const taskCard = this.closest('.task-card');
    //             if (taskCard) {
    //                 console.log('Removing interactive-hover from task card');
    //                 taskCard.classList.remove('interactive-hover');
    //             }
    //         });
    //     });
    // }

    // Newest version
    document.querySelectorAll('.task-card').forEach(taskCard => {
        taskCard.addEventListener('mouseenter', function () {
            this.classList.add('interactive-hover');
        });
        taskCard.addEventListener('mouseleave', function () {
            this.classList.remove('interactive-hover');
        });
    });

    // Trying this earlier version of code from display tasks when only card view was there because thinking what's the point of checking the view, as we know that interactive elements like tag or reminder-button only exist there.

    // document.querySelectorAll('.tag-button, .reminder-button, .task-tag').forEach(element => {
    //     element.addEventListener('mouseenter', function () {
    //         // Find the parent task card
    //         const taskCard = this.closest('.task-card');
    //         if (taskCard) {
    //             // Add a class to indicate an interactive element is being hovered
    //             taskCard.classList.add('interactive-hover');
    //         }
    //     });

    //     element.addEventListener('mouseleave', function () {
    //         // Find the parent task card
    //         const taskCard = this.closest('.task-card');
    //         if (taskCard) {
    //             // Remove the class when hover ends
    //             taskCard.classList.remove('interactive-hover');
    //         }
    //     });
    // });
    // Set up task item click handlers
    function handleTaskDisplayClick(event) {
        const removeReminderBtn = document.getElementById('remove-reminder-btn');
        // Your existing card click handlers
        if (viewMode === "card") {
            console.log("event.target is ", event.target);
            if (!event.target.closest('.task-card')) return;

            // Tag button handler
            if (event.target.matches('.tag-button') || event.target.closest('.tag-button')) {
                // Your existing tag button handler
                console.log("user is ", userList.find(user => user.username === "marshian2511"));



                // const predefinedTags = [
                //     { value: uuidv4(), text: "Work" },
                //     { value: uuidv4(), text: "Personal" },
                //     { value: uuidv4(), text: "Urgent" }
                // ];

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

            // // Reminder button handler
            // if (event.target.matches('.reminder-button') || event.target.closest('.reminder-button')) {
            //     // Your existing reminder button handler
            //     event.stopPropagation();
            //     const taskId = event.target.closest('.task-card').dataset.taskId;
            //     const task = currentUser.taskList.find(t => t.task_id === taskId);
            //     if (!task.dueDate) {
            //         return;
            //     }
            //     currentReminderTaskId = taskId;
            //     showReminderModal(taskId);
            //     const setReminderBtn = document.getElementById('set-reminder-btn');
            //     if (setReminderBtn) {
            //         setReminderBtn.removeEventListener('click', handleSetReminderButtonClick);
            //         setReminderBtn.addEventListener('click', handleSetReminderButtonClick);
            //     }
            //     return;
            // }


            if (event.target.matches('.reminder-button') || event.target.closest('.reminder-button')) {
                // Your existing reminder button handler
                event.stopPropagation();
                // *** Not necessary as we are already adding this in IF condition ***

                const bellBtn = event.target.closest('.reminder-button');
                if (!bellBtn) return;

                const taskId = bellBtn.dataset.taskId;
                const bellState = bellBtn.dataset.bellState;
                // const task = currentUser.taskList.find(t => t.task_id === taskId);

                if (bellState === "noDueDate") {
                    // TODO: open flatpickr for due date (implement this later)
                    // openFlatpickrForTask(taskId);
                    console.log("bell icon clicked, opening edit modal", taskId);
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

                            setTimeout(() => {
                                const dueInput = document.getElementById('modal-dueDate');
                                const fp = dueInput && dueInput._flatpickr;
                                // Get the visible flatpickr input (altInput) if present, else fallback
                                const visibleInput = fp && fp.altInput ? fp.altInput : dueInput;
                                // Get the input's container (adjust selector if needed)
                                const inputGroup = dueInput.closest('.input-group') || dueInput.parentElement;

                                if (visibleInput) {
                                    visibleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    visibleInput.focus();
                                    if (inputGroup) {
                                        inputGroup.classList.add('highlight-due-field');
                                        setTimeout(() => inputGroup.classList.remove('highlight-due-field'), 1200);
                                    }
                                }
                            }, 100);
                        } else {
                            console.error("Error: Could not find current user or their tasks.");
                        }
                    } else {
                        console.error("Error: Could not retrieve user list.");
                    }   
                }
                // else if (bellState === "hasDueNoReminder" || bellState === "reminderActive" || bellState === "reminderFired") {
                //     // Open your reminder modal for setting/updating/removing reminder
                //     showReminderModal(taskId);
                // }
                else {
                    showReminderModal(taskId);
                }
                return;
            }

            // Task card click handler (open edit modal)
            if (event.target.closest('.task-card') &&
                !event.target.matches('.task-checkbox') &&
                !event.target.closest('.task-checkbox-wrapper') &&
                !event.target.matches('.delete-icon') &&
                !event.target.closest('.delete-icon')) {
                // if (event.target.closest('.task-card') &&
                //     !event.target.matches('.task-checkbox') &&
                //     !event.target.closest('.task-checkbox-wrapper') &&
                //     !event.target.matches('.delete-icon') &&
                //     !event.target.closest('.delete-icon') &&
                //     !event.target.matches('.tag-button') &&
                //     !event.target.closest('.tag-button') &&
                //     !event.target.matches('.reminder-button') &&
                //     !event.target.closest('.reminder-button') &&
                //     !event.target.matches('.task-tag') &&
                //     !event.target.closest('.task-tag')) {
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
        }
        else {
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
                // console.log("List item clicked, opening edit modal", taskId);
                // document.getElementById("modal-title").textContent = "Update Task";
                // isEditMode = true;
                // editTaskId = taskId;

                // const storedUsers = localStorage.getItem(userListKey);
                // if (storedUsers) {
                //     const usersArray = JSON.parse(storedUsers);
                //     const currentUserData = usersArray.find(u => u.username === currentUser.username);
                //     if (currentUserData && currentUserData.taskList) {
                //         const task = currentUserData.taskList.find(t => t.task_id === taskId);
                //         console.log("Task for edit (list view):", task);
                //         populateModalForm(task);
                //         modal.style.display = "block";
                //     } else {
                //         console.error("Error: Could not find current user or their tasks.");
                //     }
                // } else {
                //     console.error("Error: Could not retrieve user list.");
                // }
                // resetViewToggle();


                // let task = currentUser.taskList.find(task => task.task_id === taskId);
                // focusTaskInUI(task);
                // highlightTask(taskId);
                console.log("List item clicked, switching to card view for task:", taskId);

                // Update the view-all-button state
                const viewAllButton = document.querySelector(".view-all-button");
                if (viewAllButton) {
                    viewAllButton.dataset.viewMode = "card";
                    viewAllButton.querySelector('i').textContent = "view_list";
                    viewAllButton.querySelector('span').textContent = "View All Tasks";

                }

                // *** Updating the app state when clicking on the task in list view ***
                appState.currentView = "card";
                // if (focusedTaskId && taskId === focusedTaskId) {
                //     setTimeout(() => {
                //         focusTaskInUI(task);
                //         highlightTask(focusedTaskId);
                //     }, 200); // Delay to ensure DOM is updated
                // }  

                // Switch to card view and focus the task

                // const sortedList = sorting();
                // displayTasks(currentUser, sortedList, "", "card", taskId);
                // displayTasks(currentUser, currentUser.taskList, "", "card", taskId);
                refreshTaskDisplay(taskId);

            }
        }
    }

    // Remove existing and add new event listener
    taskDisplay.removeEventListener("click", handleTaskDisplayClick);
    taskDisplay.addEventListener("click", handleTaskDisplayClick);

    // Call the setupTaskCheckboxes method from deletionManager to reattach checkbox handlers
    // if (typeof deletionManagerInstance !== 'undefined') {
    //     console.log("deletionManagerInstance was undefined, therefore defining it manually.");
    //     setTimeout(() => deletionManagerInstance.setupTaskCheckboxes(), 0);
    // }
}


// function setupFloatingButtonsScrollHandler() {
//     const taskDisplay = document.querySelector("#task-display");
//     const jumpToTopBtn = document.getElementById('jump-to-top-btn');
//     const jumpToBottomBtn = document.getElementById('jump-to-bottom-btn');

//     if (!taskDisplay || !jumpToTopBtn || !jumpToBottomBtn) {
//         console.log("Missing elements:", {
//             taskDisplay: !!taskDisplay,
//             jumpToTopBtn: !!jumpToTopBtn,
//             jumpToBottomBtn: !!jumpToBottomBtn
//         });
//         return;
//     }

//     console.log("Setting up floating buttons");

//     const toggleButtonsVisibility = _.throttle(() => {
//         const scrollTop = taskDisplay.scrollTop;
//         const scrollHeight = taskDisplay.scrollHeight;
//         const clientHeight = taskDisplay.clientHeight;

//         console.log("Scroll info:", {
//             scrollTop,
//             scrollHeight,
//             clientHeight,
//             shouldShowTop: scrollTop > 500,
//             shouldShowBottom: scrollHeight - scrollTop - clientHeight > 100
//         });

//         // Show/hide "Jump to Top" button
//         if (scrollTop > 500) {
//             jumpToTopBtn.classList.add('visible');
//             console.log("Top button should be visible");
//         } else {
//             jumpToTopBtn.classList.remove('visible');
//             console.log("Top button should be hidden");
//         }

//         // Show/hide "Jump to Bottom" button
//         const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
//         if (distanceFromBottom > 100) {
//             jumpToBottomBtn.classList.add('visible');
//             console.log("Bottom button should be visible");
//         } else {
//             jumpToBottomBtn.classList.remove('visible');
//             console.log("Bottom button should be hidden");
//         }
//     }, 100);

//     // Add scroll event listener
//     taskDisplay.addEventListener('scroll', toggleButtonsVisibility);
//     console.log("Added scroll listener");

//     // Add click handlers
//     jumpToTopBtn.addEventListener('click', () => {
//         console.log("Scrolling to top");
//         taskDisplay.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     });

//     jumpToBottomBtn.addEventListener('click', () => {
//         console.log("Scrolling to bottom");
//         taskDisplay.scrollTo({
//             top: taskDisplay.scrollHeight,
//             behavior: 'smooth'
//         });
//     });

//     // Initial check for button visibility
//     toggleButtonsVisibility();
//     console.log("Initial visibility check complete");
// }

// function setupFloatingButtonsScrollHandler() {
//     const taskDisplay = document.querySelector("#task-display");
//     const jumpToTopBtn = document.getElementById('jump-to-top-btn');
//     const jumpToBottomBtn = document.getElementById('jump-to-bottom-btn');

//     // Keep your original error checking
//     if (!taskDisplay || !jumpToTopBtn || !jumpToBottomBtn) {
//         console.log("Missing elements:", {
//             taskDisplay: !!taskDisplay,
//             jumpToTopBtn: !!jumpToTopBtn,
//             jumpToBottomBtn: !!jumpToBottomBtn
//         });
//         return;
//     }

//     console.log("Setting up floating buttons");

//     const toggleButtonsVisibility = _.throttle(() => {
//         const scrollTop = taskDisplay.scrollTop;
//         const scrollHeight = taskDisplay.scrollHeight;
//         const clientHeight = taskDisplay.clientHeight;

//         // Only proceed if content is actually scrollable
//         if (scrollHeight > clientHeight) {
//             const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

//             console.log("Scroll info:", {
//                 scrollTop,
//                 scrollHeight,
//                 clientHeight,
//                 scrollPercentage,
//                 isScrollable: true
//             });

//             // Show top button after scrolling down 20% of the content
//             if (scrollPercentage > 20) {
//                 jumpToTopBtn.classList.add('visible');
//                 console.log("Top button should be visible");
//             } else {
//                 jumpToTopBtn.classList.remove('visible');
//                 console.log("Top button should be hidden");
//             }

//             // Show bottom button when not near the bottom (less than 80% scrolled)
//             if (scrollPercentage < 80) {
//                 jumpToBottomBtn.classList.add('visible');
//                 console.log("Bottom button should be visible");
//             } else {
//                 jumpToBottomBtn.classList.remove('visible');
//                 console.log("Bottom button should be hidden");
//             }
//         } else {
//             // If content isn't scrollable, hide both buttons
//             jumpToTopBtn.classList.remove('visible');
//             jumpToBottomBtn.classList.remove('visible');
//             console.log("Content not scrollable, hiding both buttons");
//         }
//     }, 100);

//     // Keep your original event listeners
//     taskDisplay.addEventListener('scroll', toggleButtonsVisibility);

//     // Keep your original click handlers
//     jumpToTopBtn.addEventListener('click', () => {
//         console.log("Scrolling to top");
//         taskDisplay.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     });

//     jumpToBottomBtn.addEventListener('click', () => {
//         console.log("Scrolling to bottom");
//         taskDisplay.scrollTo({
//             top: taskDisplay.scrollHeight,
//             behavior: 'smooth'
//         });
//     });

//     // Keep your original initial visibility check with timeout
//     setTimeout(() => {
//         toggleButtonsVisibility();
//         console.log("Initial visibility check complete");
//     }, 100);
// }

function createFloatingButtons(container) {
    // Remove any existing buttons first
    const existingButtons = container.querySelectorAll('.jump-button');
    existingButtons.forEach(button => button.remove());

    // Create buttons HTML
    const buttonsHTML = `
        <button id="jump-to-top-btn" class="jump-button jump-to-top" aria-label="Jump to top of task list">
            <span class="material-icons">arrow_upward</span>
        </button>
        <button id="jump-to-bottom-btn" class="jump-button jump-to-bottom" aria-label="Jump to bottom of task list">
            <span class="material-icons">arrow_downward</span>
        </button>
    `;
    container.insertAdjacentHTML('beforeend', buttonsHTML);

    // Get button references
    const jumpToTopBtn = document.getElementById('jump-to-top-btn');
    const jumpToBottomBtn = document.getElementById('jump-to-bottom-btn');

    return { jumpToTopBtn, jumpToBottomBtn };
}

function setupFloatingButtonsScrollHandler(viewMode = "list") {
    const taskDisplay = document.querySelector("#task-display");
    const { jumpToTopBtn, jumpToBottomBtn } = createFloatingButtons(taskDisplay);

    if (!taskDisplay || !jumpToTopBtn || (viewMode === "list" && !jumpToBottomBtn)) {
        console.log("Missing elements:", {
            taskDisplay: !!taskDisplay,
            jumpToTopBtn: !!jumpToTopBtn,
            jumpToBottomBtn: viewMode === "list" ? !!jumpToBottomBtn : "not required"
        });
        return;
    }

    console.log("Setting up floating buttons for", viewMode, "view");

    // Hide bottom button in card view
    if (viewMode === "card" && jumpToBottomBtn) {
        jumpToBottomBtn.style.display = "none";
    }

    const toggleButtonsVisibility = _.throttle(() => {
        if (!appState.floatingButtons.isEnabled) {
            jumpToTopBtn.classList.remove('visible');
            if (jumpToBottomBtn) jumpToBottomBtn.classList.remove('visible');
            return;
        }

        const scrollTop = taskDisplay.scrollTop;
        const scrollHeight = taskDisplay.scrollHeight;
        const clientHeight = taskDisplay.clientHeight;

        if (scrollHeight > clientHeight) {
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

            // Update appState and button visibility for top button
            appState.floatingButtons.visible.top = scrollPercentage > 20;
            if (appState.floatingButtons.visible.top) {
                jumpToTopBtn.classList.add('visible');
            } else {
                jumpToTopBtn.classList.remove('visible');
            }

            // Only handle bottom button in list view
            if (viewMode === "list" && jumpToBottomBtn) {
                appState.floatingButtons.visible.bottom = scrollPercentage < 80;
                if (appState.floatingButtons.visible.bottom) {
                    jumpToBottomBtn.classList.add('visible');
                } else {
                    jumpToBottomBtn.classList.remove('visible');
                }
            }
        } else {
            // Reset visibility in appState and UI when content isn't scrollable
            appState.floatingButtons.visible.top = false;
            appState.floatingButtons.visible.bottom = false;
            jumpToTopBtn.classList.remove('visible');
            if (jumpToBottomBtn) jumpToBottomBtn.classList.remove('visible');
        }
    }, 100);

    // Scroll event listener
    taskDisplay.addEventListener('scroll', toggleButtonsVisibility);

    // Click handlers
    jumpToTopBtn.addEventListener('click', () => {
        console.log("Scrolling to top");
        taskDisplay.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    if (viewMode === "list" && jumpToBottomBtn) {
        jumpToBottomBtn.addEventListener('click', () => {
            console.log("Scrolling to bottom");
            taskDisplay.scrollTo({
                top: taskDisplay.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // Initial visibility check
    setTimeout(() => {
        toggleButtonsVisibility();
        console.log("Initial visibility check complete");
    }, 100);
}

// #############################################################################################################
// function getReminderTooltipText(dueDate, hasReminder) {
//     if (!dueDate) {
//         return 'Set date and time';
//     }
//     const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
//     return hasReminder ? 'Update/Remove Reminder':`Set Reminder for ${formattedDate}`;
// }


// for (const task of user_task_ls) {
//     const taskCard = document.createElement("div");
//     taskCard.className = "task-card";

//     // Convert the task's due date to a formatted string
//     const dueDate = new Date(task.dueDate);
//     const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();

//     // taskCard.innerHTML = `
//     //     <div class="card-header">
//     //         <h3 class="task-title">${task.task}</h3>
//     //         <div class="status-priority>
//     //             <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
//     //             <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
//     //                 <span>${getPriorityEmoji(task.priority)}</span>
//     //                 <span>${capitalize(task.priority)}</span>
//     //             </div>
//     //         </div>
//     //     </div>

//     //     <!-- For showing added tags later on(basically future add-ons) -->

//     //     <!-- Container for showing tag modal when clicking on add tag button  -->
//     //     <div class="tags-container">
//     //     </div>

//     //     <div class="card-footer">
//     //         <button class="tag-button" data-task-id ="${task.task_id}">
//     //             <span class="tag-icon">+</span>
//     //             <span>Add Tag</span>
//     //         </button>
//     //         <button class="reminder-btn" title="${formattedDate}" date-has-reminder="true">
//     //             <span>🔔</span>
//     //         </button>
//     //     </div> `;


//     taskCard.innerHTML = `
//         <div class="task-selection">
//             <div class="task-checkbox-wrapper">
//                 <input type="checkbox" class="task-checkbox" data-task-id="${task.task_id}">
//                 <div class="checkbox-custom"></div>
//             </div>
//             <i class="material-icons delete-icon" data-task-id="${task.task_id}">delete</i>
//         </div>

//         <div class="card-header">
//             <h3 class="task-title">${task.task}</h3>
//             <div class="status-priority">
//                 <div class="status-badge" data-status="${task.status.toLowerCase()}">${getStatusEmoji(task.status)}</div>
//                 <div class="priority-flag" data-priority="${task.priority.toLowerCase()}">
//                     <span>${getPriorityEmoji(task.priority)}</span>
//                     <span>${capitalize(task.priority)}</span>
//                 </div>
//             </div>
//         </div>

//         <div class="tags-container"> </div>


//         <div class="card-footer">
//             <button class="tag-button" ">
//                 <span class="tag-icon">+</span>
//                 <span>Add Tag</span>
//             </button>
//             <button class="reminder-btn" title="${formattedDate}" date-has-reminder="true">
//                 <span>🔔</span>
//             </button>
//         </div> `;

//     // ******************************************

//     // deletionManager = new DeletionManager();
//     // deletionManager.setupTaskCheckboxes();
//     // *******************************************************
//     // // Selecting all the checkboxes
//     // const checkboxes = document.querySelectorAll('.task-checkbox');
//     // checkboxes.forEach(checkbox => {
//     //     checkbox.addEventListener('change',function() {
//     //         const taskId = this.dataset.task_id;
//     //         if (this.checked) {
//     //             selectedTasks.add(taskId);
//     //         }
//     //         else {
//     //             // Set does nothing if taskId not exist in set.
//     //             // if (selectedTasks.has(taskId)){
//     //                 selectedTasks.delete(taskId);
//     //             // }
//     //         }

//     //         // Update selection bar visibility and counter
//     //         const selectionBar = document.querySelector('.selection-bar');
//     //         // Basically means, if any task is selected.
//     //         if (selectedTasks.size > 0) {
//     //             selectionBar.style.display = 'flex';
//     //             selectionBar.querySelector('.selected-count').textContent = 
//     //             `${selectedTasks.size} selected`;
//     //         }
//     //         else {
//     //             selectionBar.style.display = 'none';
//     //         }
//     //     });
//     // });

//     // *************************************

//     taskCard.querySelector('.tag-button').dataset.taskid = task.task_id;
//     // Add click handler for editing(i.e. allow to edit only if it is not click at any button like add tag, notify or tags chip itself.)
//     taskCard.addEventListener("click", (e) => {

//         // If clciked on checkbox or delete icon, don't open modal.
//         if (e.target.closest('.task-checkbox') || e.target.closest('.delete-icon')) {
//             return;
//         }

//         // If clicked on tag button or reminder button, don't open modal.
//         // if (e.target.closest('.tag-button') ||e.target.closest('.reminder-btn')){
//         //     return;
//         // }

//         // **************************** Check this part *************************
//         // This condition is sort of redundant, but let's add it for now.
//         if (!e.target.closest('.tag-button') && !e.target.closest('.reminder-btn')) {
//             document.getElementById("modal-title").textContent = "Update Task";
//             isEditMode = true; // Using the global variable
//             editTaskId = task.task_id; // Using the global variable
//             populateModalForm(task);
//             modal.style.display = "block";
//             // Added later on, after working with delete functionality.
//         }

//         // else if (e.target.closest('.tag-button')) {
//         else if (e.target.closest('.tag-button')) {
//             const button = e.target.closest('.tag-button');

//             // Setting the task_id to tagModal from tagButton.
//             const taskId = button.dataset.taskid;
//             console.log("taskId at button is ", taskId);
//             tagModal.dataset.taskid = taskId; // Set taskId on the modal
//             tagModal.style.display = 'block';
//             tagHandler(user, predefinedTags, tagModal);
//             console.log(tagModal.dataset.taskid);
//         }
//     });

//     cardContainer.appendChild(taskCard);

// }

// Initialize selection manager if not already done
// if (!selectionManager) {
//     selectionManager = new SelectionManager();
// }

// ******** This will cause multiple event listeners to get attached to setupTaskCheckboxes(); or all the delete functionality.
// Setup checkboxes for all tasks
// deletionManager.setupTaskCheckboxes();

// Calling the handleDelete() of selectionManager class.
// Handle complete delete functionality.
// Calling the delete function ----> Not exist.
// deletionManager.handleDelete(user);
// Updating in local storage
// ........
// localStorage.setItem(user.username, JSON.stringify(user.toData()));
// ........
// Displaying the updated taskList.
// return {update_details};
// return { displayTasks };




// console.log("selectedtasks  count is ", selectedTasks.size);
// console.log("selectedTasks are : ", Array.from(selectedTasks));

// Deletion call code starting.
//*** */ I don't think I should add this in app.js (because I am handling everything in my selectionManager.js and data.js file, so don't need feel any need to do this here. but ofcourse i need to call displayTasks(user) after deletion.)

// export function handleTaskDeletion(user) {

//     // user.deleteTask()
//     localStorage.setItem(currentUser.username, JSON.stringify(user.toData()));
//     displayTasks(user);
// }

// *** Deletion call code


// Notification center code
// *** Will add uuid to user if needed, right now username is fine. ***

// function notificationCenter(){

// *** Written by me ***
// Need to open the notification modal
// const notificationModal = document.querySelector('.notification-modal');
// const openButton = document.querySelector('.notification-center-button');
// const closeButton = document.querySelector('.notification-modal-header .close-button');

// console.log("notificatoinModal is ", notificationModal);
// console.log("openButton is ", openButton);
// console.log("closeButton is ", closeButton);

// openButton.addEventListener('click',() => {
//     notificationModal.style.display = 'block';
// });

// closeButton.addEventListener('click',() =>{
//     notificationModal.style.display = 'none';
// });

// ######################################################
// Handle clicks outside the panel
// *** Here, I don't know how to pass the event, have to figure it out. ***
// function handleOutsideClick(e) {
//     // Does it mean that we haven't click on notification modal and it do mean that we clicked outside, so close the notification modal.
//     if (!notificationModal.contains(e.target)){
//         console.log("e.target is ", e.target);
//         notificationModal.style.display = 'none';
//     }
// }

// handleOutsideClick();

// ??? is there any need of this function and what we are doing in fitlerPanel, handleOutsideClick function ???
// Does it mean that we haven't click on notification modal and it do mean that we clicked outside, so close the notification modal.
// if (!notificationModal.contains(e.target)){
//     console.log("e.target is ", e.target);
//     notificationModal.style.display = 'none';
// }

async function getBellState(task) {
    if (!task.dueDate) return "noDueDate"; // No due date set

    // Using reminder in place of notification because already using const notification at other place.
    // If reminder exist means notification exist
    const reminder = await dbStorageInstance.getNotificationByTaskId(task.task_id);
    if (!reminder) return "hasDueNoReminder"; // Due date, but no reminder set.
    console.log("reminder is ", reminder);
    console.log("reminder.notified is ", reminder.notified);
    // if (reminder.notified) return "reminderFired"; // Notified/delivered
    if (reminder.notified) {
        console.log("reminder is not active, notification fired", reminder.notified);
        return "reminderFired"; // Notified/delivered
    }
    else {
        console.log("reminder is active", reminder.notified);
    }
    return "reminderActive"; // Reminder is set and active

}

// function getBellIconHTML(hasReminder, hasDueDate) {
//     let svgContent = '';
//     let tooltipText = '';

//     if (hasReminder) {
//         // Ring bell for active reminders

//         svgContent = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//                 <path d="M2 8c0-2.2.7-4.3 2-6" stroke="currentColor" stroke-width="2"></path>
//                 <path d="M22 8a10 10 0 0 0-2-6" stroke="currentColor" stroke-width="2"></path>
//             </svg>
//         `;

//         tooltipText = 'Update/Remove Reminder';
//     } else if (hasDueDate) {
//         // Gold bell (for tasks with due date no reminder)
//         svgContent = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//             </svg>
//         `;
//         const dueDate = new Date(hasDueDate);
//         const formattedDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
//         tooltipText = `Set reminder (${formattedDate})`;
//     } else {
//         // Grey bell (for tasks with no due date)
//         svgContent = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//             </svg>
//         `;
//         tooltipText = 'Set date and time';
//     }

//     return `
//         <span class="bell-icon">
//                 ${svgContent}
//         </span>
//         <div class="reminder-tooltip">${tooltipText}</div>
//     `;
// }


// function getBellIconHTML(bellState, dueDate) {
//     let svg = "";
//     let tooltip = "";

//     switch (bellState) {
//         case "noDueDate":
//             svg = `
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#808080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
//                 </svg>
//                 `;
//             tooltip = "Set date and time";
//             break;
//         case "hasDueNoReminder":
//             svg = `
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#f59f00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
//                 </svg>
//                 `;
//             tooltip = `Set reminder (${dueDate ? new Date(dueDate).toLocaleString() : ""})`;
//             break;
//         case "reminderActive":
//             svg = `
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#f59f00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:relative;">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
//                 <text x="7" y="15" font-size="7" fill="#f59f00" font-family="Arial">Z</text>
//                 </svg>
//                 `;
//             tooltip = "Update/remove reminder";
//             break;
//         case "reminderFired":
//             svg = `
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#f59f00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4;">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
//                 <text x="7" y="15" font-size="7" fill="#f59f00" font-family="Arial">Z</text>
//                 </svg>
//                 `;
//             tooltip = "Update/remove reminder (notified)";
//             break;
//     }
//     return `<span class="bell-icon">${svg}</span><div class="reminder-tooltip">${tooltip}</div>`;
// }
function getBellIconHTML(bellState, dueDate) {
    let bellSVG = "";
    let tooltip = "";

    switch (bellState) {
        case "noDueDate":
            // Grey regular bell
            bellSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>`;
            tooltip = "Set date and time";
            break;

        case "hasDueNoReminder":
            // Yellow regular bell
            bellSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>`;
            tooltip = `Set reminder (${dueDate ? new Date(dueDate).toLocaleString() : ""})`;
            break;

        case "reminderActive":
            // Bell with sound waves (snooze bell)
            bellSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <path d="M2 8c0-2.2.7-4.3 2-6"></path>
                <path d="M22 8a10 10 0 0 0-2-6"></path>
            </svg>`;
            tooltip = "Update/remove reminder";
            break;

        case "reminderFired":
            // Faded bell with sound waves
            bellSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <path d="M2 8c0-2.2.7-4.3 2-6"></path>
                <path d="M22 8a10 10 0 0 0-2-6"></path>
            </svg>`;
            tooltip = "Update/remove reminder (notified)";
            break;
    }

    return `<div class="bell-icon">${bellSVG}</div><div class="reminder-tooltip">${tooltip}</div>`;
}


async function handleNotificationSubmit(event) {
    event.preventDefault();
    if (!currentReminderTaskId) return;

    const formData = handleReminderFormData();

    // Not needed because below code is doing the same validation, we don't need this validation function anymore.
    // const errors = FormValidator.validateReminderForm(formData);
    // if (errors.length > 0) {
    //     showFormErrors(errors, 'reminder-form');
    //     return;
    // }

    if (!formData.presetValue && !formData.customTime) {
        showFormErrors(['Please select a reminder time'], 'reminder-form');
        return;
    }

    // *** This task check is redundant ***
    // Don't know why the task name hasn't updated in the notification data.
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


    // *** This commented line of code is no more valid because we are using custom timer over flatpickr timer. ***

    // Calculate reminder time
    // if (formData.presetValue) {
    //     switch (formData.presetValue) {
    //         case '15min':
    //             reminderDate.setMinutes(dueDate.getMinutes() - 15);
    //             break;
    //         case '1hour':
    //             reminderDate.setHours(dueDate.getHours() - 1);
    //             break;
    //         case '1day':
    //             reminderDate.setDate(dueDate.getDate() - 1);
    //             break;
    //     }
    // } else {
    //     const [hours, minutes] = formData.customTime.split(':');
    //     const totalMinutes = (+hours * 60) + +minutes;
    //     reminderDate.setMinutes(dueDate.getMinutes() - totalMinutes);
    // }
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

    // ################################################
    // const updateBell = (hasReminder) => {
    //     if (reminderButton) {
    //         reminderButton.innerHTML = getBellIconHTML(hasReminder);
    //         reminderButton.dataset.reminderSet = hasReminder;
    //         reminderButton.classList.toggle('setting-reminder', hasReminder);
    //     }
    // };
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
        updateBellIcon(currentReminderTaskId);
        // updateBellIcon(currentReminderTaskId, true);

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

                // Update bell icon state
                // const reminderButton = document.querySelector(`[data-task-id="${currentReminderTaskId}"]`);
                // if (reminderButton) {
                //     reminderButton.classList.add('setting-reminder');
                //     const bellIcon = reminderButton.querySelector('.bell-icon');
                //     if (bellIcon) {
                //         // bellIcon.innerHTML = `
                //         // <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                //         //     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                //         //     <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                //         // </svg>`;
                //         bellIcon.innerHTML = `
                //         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                //             <path d="M2 8c0-2.2.7-4.3 2-6" stroke="currentColor" stroke-width="2"></path>
                //             <path d="M22 8a10 10 0 0 0-2-6" stroke="currentColor" stroke-width="2"></path>
                //         </svg>
                //     `;

                //         // Hide tooltip when reminder/notification is set.
                //         const tooltip = reminderButton.querySelector('.reminder-tooltip');
                //         if (tooltip) tooltip.style.display = 'none';
                //     }
                // }
                // updateBellStateOnUI(currentReminderTaskId, true);
                updateBellIcon(currentReminderTaskId);
                // updateBellIcon(currentReminderTaskId, true);
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

// function updateBellIcon(taskId, hasReminder) {
//     const reminderButton = document.querySelector(`.task-card[data-task-id="${taskId}"] .reminder-button`);
//     if (!reminderButton) return;

//     const task = currentUser.taskList.find(t => t.task_id === taskId);
//     if (!task) return;

//     reminderButton.innerHTML = getBellIconHTML(hasReminder, task.dueDate);
//     reminderButton.dataset.reminderSet = hasReminder;
//     reminderButton.classList.toggle('setting-reminder', hasReminder);
// }

async function updateBellIcon(taskId) {
    const task = currentUser.taskList.find(t => t.task_id === taskId);
    if (!task) return;
    const bellState = await getBellState(task);
    const reminderButton = document.querySelector(`.task-card[data-task-id="${taskId}"] .reminder-button`);
    if (!reminderButton) return;
    reminderButton.innerHTML = getBellIconHTML(bellState, task.dueDate);
    reminderButton.className = `reminder-button bell-${bellState}`;
    reminderButton.dataset.bellState = bellState;
}

// Maybe this function redundant, it was earlier suppose to set reminder state.

// function handleSetReminderButtonClick() {
//     const reminderButton = document.querySelector(`.task-card[data-task-id="${currentReminderTaskId}"] .reminder-button`);
//     const task = currentUser.taskList.find(t => t.task_id === currentReminderTaskId);
//     if (reminderButton && task && task.dueDate) {
//         reminderButton.classList.add('setting-reminder');
//         reminderButton.innerHTML = getBellIconHTML(true, task.dueDate);
//     }
// }

async function checkExistingNotification(taskId) {
    const existingNotification = await dbStorageInstance.getNotificationByTaskId(taskId);
    return existingNotification !== null;
}

async function removeTaskReminder(taskId) {
    // *** Below commented code won't work because it is so much different from my application other functionalities. ***

    // // Retrieve the task
    // const task = getTaskById(taskId);
    // if (!task) return;

    // // Remove reminder data from task
    // task.reminder = null;

    // // Update task in storage
    // updateTask(task);

    // // Update UI - change bell icon
    // const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);
    // if (taskCard) {
    //     const bellIcon = taskCard.querySelector('.bell-icon');
    //     if (bellIcon) {
    //         bellIcon.classList.remove('ring-bell');
    //         bellIcon.classList.add('yellow-bell');
    //         bellIcon.setAttribute('title', 'Set Reminder');
    //     }
    // }

    // // Cancel any scheduled notifications for this task
    // cancelTaskNotification(taskId);

    // ##############################################
    // const reminderButton = document.querySelector(`.task-card[data-task-id="${taskId}"] .reminder-button`);
    // const task = currentUser.taskList.find(t => t.task_id === taskId);
    // try {
    //     await dbStorageInstance.deleteNotification(taskId);
    //     console.log('Reminder removed for task:', task.task);
    //     showSuccess('Reminder removed successfully');
    //     // No reminder exist for this task anymore only have due date and time.
    //     // updateBellStateOnUI(taskId, false);


    //     if (reminderButton) {
    //         reminderButton.innerHTML = getBellIconHTML(false, task.dueDate);
    //         reminderButton.dataset.reminderSet = false;
    //         reminderButton.classList.remove('setting-reminder');
    //     }

    // } catch (error) {
    //     console.error('Error removing reminder:', error);
    //     showFormErrors(['Failed to remove reminder'], 'reminder-form');
    // }
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
        updateBellIcon(taskId);
        // updateBellIcon(taskId, false);
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
            // updateBellIcon(currentReminderTaskId);
            
        }
    });
}

// function setupReminderModal() {
//     const reminderModal = document.getElementById('reminder-modal');
//     const closeReminderModalBtn = document.getElementById('close-reminder-modal');
//     const reminderForm = document.getElementById('reminder-form');
//     const presetChips = document.querySelectorAll('.preset-chip');
//     const removeReminderBtn = document.getElementById('remove-reminder-btn');
//     const timeInputs = document.querySelectorAll('.time-input');

//     // Handle preset chip selection
//     presetChips.forEach(chip => {
//         chip.addEventListener('click', () => {
//             presetChips.forEach(c => c.classList.remove('selected'));
//             chip.classList.add('selected');

//             // Reset custom time inputs when preset is selected
//             document.getElementById('days-input').value = '0';
//             document.getElementById('hours-input').value = '0';
//             document.getElementById('minutes-input').value = '0';

//             updateReminderPreview();
//         });
//     });

//     // Handle custom time input changes
//     timeInputs.forEach(input => {
//         input.addEventListener('input', () => {
//             // Deselect all preset chips when using custom time
//             presetChips.forEach(chip => chip.classList.remove('selected'));
//             updateReminderPreview();
//         });
//     });

//     // Initialize the reminder preview
//     updateReminderPreview();

//     // Handle closing the modal
//     closeReminderModalBtn.addEventListener('click', () => {
//         reminderModal.style.display = 'none';
//         currentReminderTaskId = null;
//         clearReminderForm();
//     });

//     // Code is for closing the modal when clicking outside of it. but it is not working.
//     // reminderModal.addEventListener('click', (e) => {
//     //     if (e.target === reminderModal) {
//     //         reminderModal.style.display = 'none';
//     //         currentReminderTaskId = null;
//     //         clearReminderForm();
//     //     }
//     // });

//     // ??????? The code is also not working don't know why?
//     // Enhanced outside click handling
//     // function handleOutsideClick(e) {
//     //     const modalContent = reminderModal.querySelector('.modal-content');
//     //     if (e.target === reminderModal && !modalContent.contains(e.target)) {
//     //         reminderModal.style.display = 'none';
//     //         currentReminderTaskId = null;
//     //         clearReminderForm();
//     //     }
//     // }

//     // // Add event listener for outside clicks
//     // document.addEventListener('click', handleOutsideClick);


//     // Handle form submission
//     reminderForm.addEventListener('submit', handleNotificationSubmit);

//     // Handle remove reminder button
//     removeReminderBtn.addEventListener('click', (e) => {
//         e.preventDefault();
//         if (currentReminderTaskId) {
//             removeTaskReminder(currentReminderTaskId);
//             reminderModal.style.display = 'none';
//             currentReminderTaskId = null;
//         }
//     });
// }

// async function showReminderModal(taskId) {
//     console.log(`showReminderModal called for taskId: ${taskId}`);
//     const reminderModal = document.getElementById('reminder-modal');
//     const removeReminderBtn = document.getElementById('remove-reminder-btn');
//     const existingNotification = await dbStorageInstance.getNotificationByTaskId(taskId);
//     console.log("Reminder already exists for this task, so we won't show the reminder modal.", existingNotification);

//     // Store the current task ID
//     currentReminderTaskId = taskId;

//     // Clear the form
//     clearReminderForm();

//     // Show/hide remove button based on whether editing existing reminder
//     // if (existingReminder) {
//     //     removeReminderBtn.style.display = 'block';

//     //     // Populate form with existing reminder data
//     //     if (existingReminder.presetValue) {
//     //         const chip = document.querySelector(`.preset-chip[data-value="${existingReminder.presetValue}"]`);
//     //         if (chip) {
//     //             chip.classList.add('selected');
//     //         }
//     //     } else if (existingReminder.customTime) {
//     //         const days = existingReminder.customTime.days || 0;
//     //         const hours = existingReminder.customTime.hours || 0;
//     //         const minutes = existingReminder.customTime.minutes || 0;

//     //         document.getElementById('days-input').value = days;
//     //         document.getElementById('hours-input').value = hours;
//     //         document.getElementById('minutes-input').value = minutes;
//     //     }

//     //     updateReminderPreview();
//     // } else {
//     //     removeReminderBtn.style.display = 'none';
//     // }

//     // Show remove reminder button if there is existing notification.
//     if (existingNotification) {
//         removeReminderBtn.style.display = 'block';

//         const reminderDate = new Date(existingNotification.reminderDate);
//         const dueDate = new Date(existingNotification.dueDate);
//         const offsetMs = dueDate.getTime() - reminderDate.getTime();

//         // Select the appropriate preset chip or populate custom inputs.

//         if (offsetMs === (15 * 60 * 1000)) {
//             const chip = document.querySelector(`.preset-chip[data-value="15min"]`);
//             if (chip) chip.classList.add('selected');
//         } else if (offsetMs === (60 * 60 * 1000)) {
//             const chip = document.querySelector(`.preset-chip[data-value="1hour"]`);
//             if (chip) chip.classList.add('selected');
//         } else if (offsetMs === (24 * 60 * 60 * 1000)) {
//             const chip = document.querySelector(`.preset-chip[data-value="1day"]`);
//             if (chip) chip.classList.add('selected');
//         } else if (offsetMs > 0) {
//             const days = Math.floor(offsetMs / (24 * 60 * 60 * 1000));
//             const hours = Math.floor((offsetMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
//             const minutes = Math.floor((offsetMs % (60 * 60 * 1000)) / (60 * 1000));

//             document.getElementById('days-input').value = days;
//             document.getElementById('hours-input').value = hours;
//             document.getElementById('minutes-input').value = minutes;
//         }

//         // ###########################

//         // Only populate custom inputs if the offset doesn't match a preset
//         // if (offsetMs !== (15 * 60 * 1000) &&
//         //     offsetMs !== (60 * 60 * 1000) &&
//         //     offsetMs !== (24 * 60 * 60 * 1000) &&
//         //     offsetMs > 0) {
//         //     const days = Math.floor(offsetMs / (24 * 60 * 60 * 1000));
//         //     const hours = Math.floor((offsetMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
//         //     const minutes = Math.floor((offsetMs % (60 * 60 * 1000)) / (60 * 1000));

//         //     document.getElementById('days-input').value = days;
//         //     document.getElementById('hours-input').value = hours;
//         //     document.getElementById('minutes-input').value = minutes;
//         // } else {
//         //     // Select the appropriate preset chip if it matches
//         //     document.querySelectorAll('.preset-chip').forEach(chip => chip.classList.remove('selected'));
//         //     if (offsetMs === (15 * 60 * 1000)) document.querySelector(`.preset-chip[data-value="15min"]`)?.classList.add('selected');
//         //     else if (offsetMs === (60 * 60 * 1000)) document.querySelector(`.preset-chip[data-value="1hour"]`)?.classList.add('selected');
//         //     else if (offsetMs === (24 * 60 * 60 * 1000)) document.querySelector(`.preset-chip[data-value="1day"]`)?.classList.add('selected');
//         // }

//     }
//     else {
//         removeReminderBtn.style.display = 'none';
//     }

//     updateReminderPreview();
//     // Show the modal
//     reminderModal.style.display = 'block';
// }

// *** Solved the issue of not showing accurate values in reminder modal. ***

// async function showReminderModal(taskId) {
//     const reminderModal = document.getElementById('reminder-modal');
//     const removeReminderBtn = document.getElementById('remove-reminder-btn');
//     const existingNotification = await dbStorageInstance.getNotificationByTaskId(taskId);
//     console.log("Reminder already exists for this task:", existingNotification);

//     currentReminderTaskId = taskId;
//     clearReminderForm();

//     const daysInput = document.getElementById('days-input');
//     const hoursInput = document.getElementById('hours-input');
//     const minutesInput = document.getElementById('minutes-input');
//     const presetChips = document.querySelectorAll('.preset-chip');

//     if (existingNotification) {
//         removeReminderBtn.style.display = 'block';

//         const reminderDate = new Date(existingNotification.reminderDate);
//         const dueDate = new Date(existingNotification.dueDate);
//         const offsetMs = existingNotification.reminderOffsetMs;
//         // const offsetMs = dueDate.getTime() - reminderDate.getTime();

//         console.log("reminderDate in update reminder is ", reminderDate);
//         console.log('dueDate in update reminder is ', dueDate);
//         console.log("offsetMs in update reminder is ", offsetMs);

// if (customInputTouched) {
//     // Populate custom inputs based on offsetMs, don't select presets
//     if (offsetMs > 0) {
//         const days = Math.floor(offsetMs / (24 * 60 * 60 * 1000));
//         const hours = Math.floor((offsetMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
//         const minutes = Math.floor((offsetMs % (60 * 60 * 1000)) / (60 * 1000));

//         daysInput.value = days;
//         hoursInput.value = hours;
//         minutesInput.value = minutes;
//     }
// } else {
//     // Select the appropriate preset chip if it matches, otherwise populate custom inputs
//     presetChips.forEach(chip => chip.classList.remove('selected'));
//     if (offsetMs === (15 * 60 * 1000)) {
//         document.querySelector(`.preset-chip[data-value="15min"]`)?.classList.add('selected');
//     } else if (offsetMs === (60 * 60 * 1000)) {
//         document.querySelector(`.preset-chip[data-value="1hour"]`)?.classList.add('selected');
//     } else if (offsetMs === (24 * 60 * 60 * 1000)) {
//         document.querySelector(`.preset-chip[data-value="1day"]`)?.classList.add('selected');
//     } else if (offsetMs > 0) {
//         const days = Math.floor(offsetMs / (24 * 60 * 60 * 1000));
//         const hours = Math.floor((offsetMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
//         const minutes = Math.floor((offsetMs % (60 * 60 * 1000)) / (60 * 1000));

//         daysInput.value = days;
//         hoursInput.value = hours;
//         minutesInput.value = minutes;
//     }
// }

//     } else {
//         removeReminderBtn.style.display = 'none';
//     }

//     updateReminderPreview();
//     reminderModal.style.display = 'block';
// }

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

// async function displayNotificationsInModal() {
//     const notificationListContainer = document.querySelector('.notification-list');
//     const emptyState = notificationListContainer.querySelector('.empty-state');
//     const allNotifications = await dbStorageInstance.getAllNotifications();
//     const currentUserId = currentUser.username;
//     console.log("CurrentUserId is ", currentUserId);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Filter notifications for the current user
//     const userNotifications = allNotifications.filter(notification => notification.userId === currentUserId);
//     notificationListContainer.innerHTML = '';

//     if (userNotifications && userNotifications.length > 0) {
//         if (emptyState) {
//             emptyState.style.display = 'none';
//         }

//         userNotifications.forEach(notification => {
//             const notificationItem = document.createElement('div');
//             notificationItem.classList.add('notification-item');

//             const iconDiv = document.createElement('div');
//             iconDiv.classList.add('notification-icon');
//             iconDiv.textContent = '📅';

//             const contentDiv = document.createElement('div');
//             contentDiv.classList.add('notification-content');

//             const titleDiv = document.createElement('div');
//             titleDiv.classList.add('notification-title');
//             const dueDate = new Date(notification.dueDate);
//             dueDate.setHours(0, 0, 0, 0);

//             if (dueDate.getTime() === today.getTime()) {
//                 titleDiv.textContent = 'Task Due Today';
//             } else if (dueDate < today) {
//                 titleDiv.textContent = 'Task Overdue';
//             } else {
//                 titleDiv.textContent = 'Upcoming Task';
//             }

//             const messageDiv = document.createElement('div');
//             messageDiv.classList.add('notification-message');
//             const dueDateString = new Date(notification.dueDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
//             messageDiv.textContent = `Your task "${notification.taskName}" is due on ${new Date(notification.dueDate).toLocaleDateString()} at ${dueDateString}.`;

//             const metaDiv = document.createElement('div');
//             metaDiv.classList.add('notification-meta');

//             const prioritySpan = document.createElement('span');
//             prioritySpan.classList.add('priority-indicator');
//             if (notification.priority) {
//                 prioritySpan.classList.add(notification.priority.toLowerCase());
//                 prioritySpan.innerHTML = `${getPriorityEmoji(notification.priority)} ${capitalize(notification.priority)}`;
//             } else {
//                 prioritySpan.textContent = 'No Priority';
//             }

//             const timestampSpan = document.createElement('span');
//             const notificationDate = new Date(notification.timestamp);
//             timestampSpan.textContent = notificationDate.toLocaleString();

//             metaDiv.appendChild(prioritySpan);
//             metaDiv.appendChild(timestampSpan);

//             contentDiv.appendChild(titleDiv);
//             contentDiv.appendChild(messageDiv);
//             contentDiv.appendChild(metaDiv);

//             notificationItem.appendChild(iconDiv);
//             notificationItem.appendChild(contentDiv);

//             notificationListContainer.appendChild(notificationItem);
//         });

//     }
//     else {
//         if (emptyState) {
//             emptyState.style.display = 'block';
//         } else {
//             const emptyDiv = document.createElement('div');
//             emptyDiv.classList.add('empty-state');
//             emptyDiv.innerHTML = '<div>No Notifications yet</div><div>You\'ll see task reminders here when they\'re due.</div>';
//             notificationListContainer.appendChild(emptyDiv);
//         }
//     }
// }

// function notificationCenter() {

//     const modalWrapper = document.querySelector('.notification-modal-wrapper');
//     const openButton = document.querySelector('.notification-center-button');
//     const closeButton = document.querySelector('.notification-modal-header .close-button');

//     // Opening the modal
//     openButton.addEventListener('click', () => {
//         //??? What is flex exactly in style or what it do ???
//         modalWrapper.style.display = 'flex';
//         displayNotificationsInModal();
//     });

//     // Closing the  modal
//     closeButton.addEventListener('click', () => {
//         modalWrapper.style.display = 'none';
//     });

//     // Close when clicking outside the modal.
//     modalWrapper.addEventListener('click', (e) => {
//         if (e.target === modalWrapper) {
//             modalWrapper.style.display = 'none';
//         }
//     });
// }


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

    // if (userNotifications && userNotifications.length > 0) {
    //     if (emptyState) {
    //         emptyState.style.display = 'none';
    //     }
    //     // emptyState.style.display = 'none';

    //     console.log("I am here to show notifications");
    //     userNotifications.forEach(notification => {
    //         const notificationItem = document.createElement('div');
    //         notificationItem.classList.add('notification-item');

    //         const iconDiv = document.createElement('div');
    //         iconDiv.classList.add('notification-icon');
    //         iconDiv.textContent = '📅';

    //         const contentDiv = document.createElement('div');
    //         contentDiv.classList.add('notification-content');

    //         const titleDiv = document.createElement('div');
    //         titleDiv.classList.add('notification-title');
    //         const dueDate = new Date(notification.dueDate);
    //         dueDate.setHours(0, 0, 0, 0);

    //         if (dueDate.getTime() === today.getTime()) {
    //             titleDiv.textContent = 'Task Due Today';
    //         } else if (dueDate < today) {
    //             titleDiv.textContent = 'Task Overdue';
    //         } else {
    //             titleDiv.textContent = 'Upcoming Task';
    //         }

    //         const messageDiv = document.createElement('div');
    //         messageDiv.classList.add('notification-message');
    //         const dueDateString = new Date(notification.dueDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    //         messageDiv.textContent = `Your task "${notification.taskName}" is due on ${new Date(notification.dueDate).toLocaleDateString()} at ${dueDateString}.`;

    //         const metaDiv = document.createElement('div');
    //         metaDiv.classList.add('notification-meta');

    //         const prioritySpan = document.createElement('span');
    //         prioritySpan.classList.add('priority-indicator');
    //         if (notification.priority) {
    //             prioritySpan.classList.add(notification.priority.toLowerCase());
    //             prioritySpan.innerHTML = `${getPriorityEmoji(notification.priority)} ${capitalize(notification.priority)}`;
    //         } else {
    //             prioritySpan.textContent = 'No Priority';
    //         }

    //         const timestampSpan = document.createElement('span');
    //         const notificationDate = new Date(notification.timestamp);
    //         timestampSpan.textContent = notificationDate.toLocaleString();

    //         metaDiv.appendChild(prioritySpan);
    //         metaDiv.appendChild(timestampSpan);

    //         contentDiv.appendChild(titleDiv);
    //         contentDiv.appendChild(messageDiv);
    //         contentDiv.appendChild(metaDiv);

    //         notificationItem.appendChild(iconDiv);
    //         notificationItem.appendChild(contentDiv);

    //         notificationListContainer.appendChild(notificationItem);
    //     });
    // } else {
    //     // if (emptyState) {
    //     //     emptyState.style.display = 'block';
    //     // }
    //     //  else {
    //     //     const emptyDiv = document.createElement('div');
    //     //     emptyDiv.classList.add('empty-state');
    //     //     emptyDiv.innerHTML = '<div>No Notifications yet</div><div>You\'ll see task reminders here when they\'re due.</div>';
    //     //     notificationListContainer.appendChild(emptyDiv);
    //     // }
    // const emptyDiv = document.createElement('div');
    // emptyDiv.classList.add('empty-state');
    // emptyDiv.innerHTML = '<div>No Notifications yet</div><div>You\'ll see task reminders here when they\'re due.</div>';
    // notificationListContainer.appendChild(emptyDiv);
    // }

    // Updated code with acknowledging the notifications.
    if (userNotifications && userNotifications.length > 0) {
        // Reversing the notifications array to show the latest notifications first.
        // const reversedNotifications = [...userNotifications].reverse();

        userNotifications.sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
            const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
            return dateB - dateA; // Sort newest first (descending)
        });

        // reversedNotifications.forEach(notification => {
        userNotifications.forEach(notification => {
            // Valid even if updatedAt is null. and it will sort for both the case when notifications are updated or created.
            // userNotifications.sort((a, b) => {
            //     const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
            //     const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
            //     return dateB - dateA; // Sort newest first (descending)
            // });

            // userNotifications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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
                prioritySpan.innerHTML = ` ${capitalize(notification.priority)}`;
                // prioritySpan.innerHTML = `${getPriorityEmoji(notification.priority)} ${capitalize(notification.priority)}`;
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


// function highlightTask(taskId) {
//     console.log("highlightTask called with taskId:", taskId);
//     let taskElement = document.getElementById(`task-${taskId}`);
//     const taskListElement = document.getElementById(`task-list-${taskId}`);
//     let viewAllBtn = document.querySelector(".view-all-button");
//     let handleClick = function() {
//         initViewToggle();
//         console.log("We clicked viewAllBtn programmatically!");
//         // Add the rest of your button's click logic here
//     };

//     // Assign the function to the onclick handler
//     viewAllBtn.onclick = handleClick;

//     if (taskElement || taskListElement) {

//         if (taskElement) {
//             taskElement.classList.add('highlighted-task');
//             console.log("Task element found and class added:", taskElement);            
//         }
//         else {
//             // let viewAllBtn = document.querySelector(".view-all-button");
//             // viewAllBtn.onclick = function() {
//             //     console.log("We clicked viewAllBtn manually");
//             // };

//             // This will allow us to switch to task card view and then there i can find that taskElement and can highlight.But it didn't happened.
//             handleClick();
//             taskElement = document.getElementById(`task-${taskId}`);
//             taskElement.classList.add('highlighted-task');
//             console.log("Tasklist element found and class added:", taskElement);
//         }
//         // Optionally, remove the highlight after a duration

//         setTimeout(() => {
//             taskElement.classList.remove('highlighted-task');
//         }, 6000); // Example: Remove after 3 seconds
//     }
//     else {
//         console.log("Task element NOT found for taskId:", taskId);
//     }
// }

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

            // navigateToTask(notification.taskId);
            // highlightTask(notification.taskId);

            // **** Think about this re-rendering of notification list again, that whether we should render the target notification or the complete list.
            // 5. Re-render the list (or update the single item)
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
// console.log("User is ", currentUser.username);

// *** Notification toggle code ***
// const notificationToggle = document.querySelector('.toggle-switch input[type="checkbox"]');

// Click was wrong event listener as it is forcefully trying to change the state of checkbox or toggle, browser automatically  handle the checked and unchecked state of checkbox(slider in our case.)

// notificationToggle.addEventListener('click', () =>{

//     if(!notificationToggle.checked){
//         console.log("Notification togglee ", notificationToggle);
//         console.log("Notification togglee checked or not? ", notificationToggle.checked);
//         notificationToggle.checked = true;
//         console.log("Notification toggle is ", notificationToggle.checked);
//     }
//     else{
//         console.log("Notification togglee ", notificationToggle);
//         console.log("Notification togglee checked or not? ", notificationToggle.checked);
//         notificationToggle.checked = false;
//         console.log("Notification toggle is ", notificationToggle.checked);
//     }
// });

// const notificationToggle = document.querySelector('.toggle-switch input[type="checkbox"]');
// notificationToggle.addEventListener('change', () => {
//     if (notificationToggle.checked) {
//         console.log("Notifications enabled");
//         // Run your "enabled" logic here
//     } else {
//         console.log("Notifications disabled");
//         // Run your "disabled" logic here
//     }
// });


// document.getElementById(notification-btn-${currentUser.username})
function setupModalHandlers() {
    // Hiding and disabling all the things in background when task modal is open either for editing/adding task.
    showGlobalOverlay();

    // let modal = document.getElementById("task-modal");
    modal = document.getElementById("task-modal");
    const openButton = document.getElementById("open-task-modal");
    const closeButton = document.getElementById("close-modal");
    // let isEditMode = false;
    // let editTaskId = null;

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

    // document.getElementById("task-form").addEventListener("submit", (event) => {
    //     event.preventDefault();
    //     const formData = handleModalFormData();

    //     const errors = FormValidator.validateTaskForm(formData);
    //     if (errors.length > 0) {
    //         showFormErrors(errors, 'task-form');
    //         return;
    //     }
    //     try {
    //         if (isEditMode && editTaskId) {
    //             // Handle Update
    //             // const taskIndex = currentUser.taskList.findIndex(task => task.task_id === editTaskId);
    //             // if (taskIndex !== -1) {
    //             //     currentUser.taskList[taskIndex] = { ...currentUser.taskList[taskIndex], ...formData };
    //             //     localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
    //             //     alert("Task updated successfully!");
    //             // }

    //             // Better move, to check that the changed task name is not same as some other existing task.

    //             // For updates, check if the task name changes
    //             const otherTasks = currentUser.taskList.filter(task => task.task_id != editTaskId);
    //             const taskExists = otherTasks.some(task => task.task === formData.task);

    //             if (taskExists) {
    //                 // alert("Task name already exists. Please choose a different name.")
    //                 showFormErrors(['Task name already exists'], 'task-form');
    //                 return;
    //             }
    //             if (currentUser.updateTask(editTaskId, formData)) {
    //                 localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
    //                 showSuccess('Task updated successfully');
    //                 modal.style.display = "none";
    //                 clearModalForm();
    //                 // alert("Task updated successfully!");
    //                 // showSuccess('Task updated successfully');
    //                 displayTasks(currentUser);

    //             }

    //         }
    //         else {
    //             // Handle new task creation
    //             const existingTask = currentUser.taskList.find(task => task.task === formData.task);
    //             if (existingTask) {
    //                 showFormErrors(['Task already exists'], 'task-form');
    //                 // alert("Task already exists. Try adding another task!");
    //                 return;
    //             }
    //             currentUser.addTasks(formData.task, formData.description, formData.status, formData.priority, formData.dueDate);
    //             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
    //             showSuccess('Task created successfully');
    //             // alert("Task created successfully!");
    //         }
    //         modal.style.display = "none";
    //         clearModalForm();
    //         displayTasks(currentUser);
    //     }
    //     catch (error) {
    //         showFormErrors([error.message], 'task-form');
    //     }

    // });

    // After closing the task modal, things will again become accessible or enable.
    hideGlobalOverlay();

}



// *** Search functionality

// Created by me...

// const searchInput = document.querySelector(".search-container input");
// let searchTaskList = [];

// searchInput.addEventListener("input", () => {
//     const inputValue = searchInput.value;
//     console.log("inputValue is ", inputValue);
//     // Iterating task of current user
//     let tempList = [];
//     currentUser.taskList.forEach(taskCard =>{
//         // const tempList = [];
//         // console.log("looping taskCard.task is ", taskCard.task);
//         // console.log("looping taskCard.description is ", taskCard.description);
//         const taskMatch = taskCard.task.includes(inputValue);
//         if (taskMatch) {
//             console.log("task is",taskCard.task);
//         }
//         console.log("taskMatch is ", taskMatch);
//         const descriptionMatch = taskCard.description.includes(inputValue);
//         console.log("descriptionMatch is ", descriptionMatch);
//         // if ((task.task.startsWith(inputValue)) || (task.description.startsWith(inputValue))){

//         // If search input is empty, then do nothing.
//         // if (inputValue.trim() === ""){
//         //     console.log("Search input is empty. ");
//         //     return;
//         // }

//         // // If searchInput is not empty and match is not found, then return a message.
//         // else if ((inputValue.trim() !== "") && (!((taskMatch || descriptionMatch)))){
//         //     console.log("No matching task, try something else...");
//         // }

//         // else if (taskMatch || descriptionMatch){
//         //     searchTaskList.push(task);
//         // }

//         if (taskMatch || descriptionMatch){
//             tempList.push(taskCard);
//                 // searchTaskList.push(taskCard);
//                 console.log("searchtaskls: ", searchTaskList);
//         }
//         else {
//             console.log("No matching task, try something else...");
//         }
//     });
//     // if (searchTaskList.length !==0 ){
//     //     console.log("searchTaskList is ", searchTaskList);
//     // }
//     if (searchTaskList.length === 0 ){
//         searchTaskList = tempList;
//         console.log("searchTaskList is ", searchTaskList);
//     }
//     else {
//         tempList.forEach(temp => {
//             if (! (searchTaskList.includes(temp))){
//                 console.log("temp is ", temp);
//                 searchTaskList.push(temp);
//             }
//         });
//         console.log("searchTaskList inside else is ", searchTaskList);
//     }
// });

// **************************************************************************************

// const searchInput = document.querySelector(".search-container input");
// const debouncedSearch = _.debounce(() => {
//     const inputValue = searchInput.value.trim();
//     if (inputValue === "") {
//         displayTasks(currentUser, currentUser.taskList);
//         return; // Exit early to avoid unnecessary filtering
//     }

//     const escapedInput = inputValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//     const regex = new RegExp(escapedInput, "i");
//     // const regex = new RegExp(inputValue, "i");
//     const searchTaskList = currentUser.taskList.filter(task =>
//         regex.test(task.task) || regex.test(task.description)
//     );


//     if (inputValue !== "" && searchTaskList.length === 0) {
//         displayTasks(currentUser, [], "No tasks match your search.")
//     } else {
//         displayTasks(currentUser, searchTaskList);
//     }

// }, 200);

// searchInput.addEventListener("input", debouncedSearch);

// *************************************************************
// Updated code

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

        // // *** When search is applied then on the whole list, so no pagination ***
        // resetPagination();

        // Refresh the task display
        refreshTaskDisplay();
    }, 200);

    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);

    }

    // Return the clearSearch function to be used when switching views
    return { clearSearch };
}

// function to handle temporary task removal
async function handleTemporaryTaskOnLoadMore() {
    // it means if temporary task don't exist
    if (!appState.temporaryTask.isActive) return;

    const tempTaskId = appState.temporaryTask.taskId;
    console.log("Checking if temporary task should be removed: ", tempTaskId);
    const nextBatchStart = appState.pagination.tasksPerPage * appState.pagination.currentPage;
    const nextBatchEnd = appState.pagination.tasksPerPage * (appState.pagination.currentPage + 1);

    const allSortedTasks = sorting();
    const nextBatchTasks = allSortedTasks.slice(nextBatchStart, nextBatchEnd);

    // Check if the temporary task is in the next batch
    const taskInNextBatch = nextBatchTasks.find(task => task.task_id === tempTaskId);
    // Get the next batch range
    // const { tasks: nextBatchTasks } = getBatchTasks(allSortedTasks, { isNextBatch: true });
    // const taskInNextBatch = nextBatchTasks.find(task => task.task_id === tempTaskId);

    if (taskInNextBatch) {
        // Remove the temporary task from UI
        const tempTaskElement = document.querySelector(`#task-${tempTaskId}`);
        if (tempTaskElement) {
            // Add a subtle animation before removal
            tempTaskElement.style.transition = 'opacity 0.3s ease-out';
            tempTaskElement.style.opacity = '0.5';

            setTimeout(() => {
                tempTaskElement.remove();
                console.log("Removed temporary task from UI:", tempTaskId);
            }, 150);
        }

        // Reset temporary task state
        appState.temporaryTask = {
            taskId: null,
            isActive: false,
            addedAt: null
        };
        console.log("Temporary task will appear in next batch, removed temporary version");
    }

}

// For refreshing the task display
function refreshTaskDisplay(focusedTaskId = null) {
    if (!currentUser || !currentUser.taskList) {
        console.error("No current user or task list available");
        return;
    }


    // Get sorted and filtered tasks
    let sortedAndFilteredTasks = sorting();

    // Handle temporary task insertion for card view
    if (focusedTaskId && appState.currentView === "card") {
        // const { tasks: currentBatchTasks } = getBatchTasks(sortedAndFilteredTasks, { fromStart: true });
        // const taskInCurrentBatch = currentBatchTasks.find(task => task.task_id === focusedTaskId);

        const currentBatchEnd = appState.pagination.tasksPerPage * appState.pagination.currentPage;
        const currentBatchTasks = sortedAndFilteredTasks.slice(0, currentBatchEnd);
        const taskInCurrentBatch = currentBatchTasks.find(task => task.task_id === focusedTaskId);

        // If tasks not exist in current batch then add the temporary task
        if (!taskInCurrentBatch) {
            const focusedTask = sortedAndFilteredTasks.find(task => task.task_id === focusedTaskId);
            if (focusedTask) {

                // Not actually removing the task from original list just filtering it out to use it at other place
                // Remove from original position and add to end of current batch
                // sortedAndFilteredTasks = sortedAndFilteredTasks.filter(task => task.task_id !== focusedTaskId);

                // Get current batch tasks
                // const currentBatchTasks = sortedAndFilteredTasks.slice(0, currentBatchEnd - 1);

                // Add focused task at the end
                // const tasksWithTemp = [...currentBatchTasks, focusedTask, ...sortedAndFilteredTasks.slice(currentBatchEnd - 1)]

                // Simple approach: just add the focused task to the current batch
                const tasksToShow = [...currentBatchTasks, focusedTask];

                // Update temporary task state
                appState.temporaryTask = {
                    taskId: focusedTaskId,
                    isActive: true,
                    addedAt: Date.now()
                };

                // sortedAndFilteredTasks = tasksWithTemp;
                sortedAndFilteredTasks = tasksToShow;
                console.log("Added temporary task: ", focusedTaskId);

                // displayTasks(currentUser, tasksToShow, "", appState.currentView, focusedTaskId);
                // return;
            }
        }
    }

    // Display tasks with the current view mode
    if (sortedAndFilteredTasks.length === 0) {

        // Reset paginatino when no results
        appState.pagination.currentPage = 1;
        appState.pagination.allTasksLoaded = true;

        // Determine the appropriate message
        let message = "";
        if (appState.searchTerm) {
            message = "No tasks match your search.";
        }
        else if (Object.values(appState.activeFilters.tags).includes(filters => filters.length > 0)) {
            message = "No tasks match the tags"
        }

        else if (Object.values(appState.activeFilters).some(filters => filters.length > 0)) {
            message = "No tasks match your filters.";
        }

        else {
            message = "No tasks available.";
        }

        displayTasks(currentUser, [], message, appState.currentView, focusedTaskId);
    } else {
        displayTasks(currentUser, sortedAndFilteredTasks, "", appState.currentView, focusedTaskId);
    }
}

function cleanupTemporaryTask() {
    if (appState.temporaryTask.isActive) {
        // const tempTaskElement = document.querySelector(`#task-${appState.temporaryTask.taskId}`);
        // if (tempTaskElement && tempTaskElement.classList.contains('temporary-task')) {
        //     tempTaskElement.remove();
        // }

        appState.temporaryTask = {
            taskId: null,
            isActive: false,
            addedAt: null
        };
        console.log("Cleaned up temporary task");
    }
}

function resetPagination() {
    appState.pagination.currentPage = 1;
    appState.pagination.isLoading = false;
    appState.pagination.allTasksLoaded = false;
    // const taskDisplay = document.querySelector("#task-display");
    // if (taskDisplay) taskDisplay.innerHTML = ""; // clear to force re-render    
}

// ############################################################
// searchInput.addEventListener("input", () => {
//     const inputValue = searchInput.value.trim();
// //     const searchTaskList = [];
// //     // 'i' is for handling case insensitivity.
// //     const regex = new RegExp(inputValue, "i");

// //     currentUser.taskList.forEach(task => {
// //       const taskMatch = regex.test(task.task);
// //       const descriptionMatch = regex.test(task.description);

// //       if (taskMatch || descriptionMatch) {
// //         searchTaskList.push(task);
// //       }

// //       // Conditional logging for debugging
// //       if (taskMatch) {
// //         console.log(`Task "${task.task}" matched.`);
// //       }
// //       if (descriptionMatch) {
// //         console.log(`Description "${task.description}" matched.`);
// //       }
// //     });

// //     console.log("Search results:", searchTaskList);
//     const regex = new RegExp(inputValue, "i");
//     const searchTaskList = currentUser.taskList.filter(task => 
//         regex.test(task.task) || regex.test(task.description)
//     );

//     if (inputValue !== "" && searchTaskList.length === 0 ){
//         displayTasks(currentUser , [], "No tasks match your search.")
//     }else {
//         displayTasks(currentUser, searchTaskList);
//     }

//   });

//***************************  Handling filter operation. *****************************************************

// const filterBtn = document.getElementById("open-filter-panel");
// filterBtn.addEventListener("click",() => {
//     const filterPanel = document.querySelector('.filter-panel');
//     filterPanel.classList.add('active');
// });

// const closeFilterBtn = document.getElementById('close-filter-panel');
// closeFilterBtn.addEventListener("click",() => {
//     const filterPanel = document.querySelector('.filter-panel');
//     filterPanel.classList.remove('active');
// });


// #######################################################
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

    console.log("I am here to get filtered tasks.");
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

        // --- Tag filter integration ---
        // Convert set to array for easier includes check
        // const taskTagsArr = Array.from(task.tagsSet || []);

        // const normalizedTaskTags = taskTagsArr.map(tag => tag.text.toLowerCase());
        const normalizedTaskTags = Array.from(task.tagsSet || []).map(tag => tag.text.toLowerCase());
        const normalizedTagFilters = (filters.tags || []).map(tag => tag.toLowerCase());
        const tagMatch =
            normalizedTagFilters.length === 0 ||
            normalizedTagFilters.every(filterTag => normalizedTaskTags.includes(filterTag));

        console.log("normalizedTaskTags", normalizedTaskTags);
        console.log("normalizedTagsFilters", normalizedTagFilters);
        console.log("TagMatch is ", tagMatch);
        // return statusMatch && priorityMatch && timeMatch;
        return statusMatch && priorityMatch && timeMatch && tagMatch;

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

function updateFilters() {
    // Collect selected filters
    const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value) || [];
    const priorityFilters = Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(cb => cb.value) || [];
    const timeFilters = Array.from(document.querySelectorAll('input[name="time"]:checked')).map(cb => cb.value) || [];
    const tagFilters = selectedFilterTags.map(tag => tag.text);
    console.log('Active filters:', { status: statusFilters, priority: priorityFilters, time: timeFilters, tags: tagFilters });

    console.log("currentUser taskList ", currentUser.taskList);

    // Instead of passing the filter options directly in the filterTasks function we are updating it in the appState.

    // const filteredTasks = filterTasks(currentUser.taskList, { status: statusFilters, priority: priorityFilters, time: timeFilters });
    // console.log("Filtered tasks is ", filteredTasks);

    appState.activeFilters = {
        status: statusFilters,
        priority: priorityFilters,
        time: timeFilters,
        tags: tagFilters
    };

    // // *** When filter is applied no pagination will exist, because we will apply filter on all tasks ***
    // resetPagination();

    // Apply sorting and filtering and update display (A function to update task display both card and list view when sorting or filtering.)
    refreshTaskDisplay();

    // ################### Part of the working and newer version of code ###########################
    // if (statusFilters.length === 0 && priorityFilters.length === 0 && timeFilters.length === 0) {
    //     // No filters selected, show all tasks
    //     displayTasks(currentUser, currentUser.taskList);
    // }
    // else if (filteredTasks.length === 0) {
    //     displayTasks(currentUser, [], "No tasks match your filters.");
    //     // return;
    // }
    // else {
    //     displayTasks(currentUser, filteredTasks);
    // }

    // ###################################################################
    // if (filteredTasks.length === 0){
    //     displayTasks(currentUser, currentUser.taskList);
    //     return;
    // }
    // displayTasks(currentUser, filteredTasks);
}

document.addEventListener('DOMContentLoaded', () => {
    // Set up filter panel events
    const appContainer = document.querySelector('.app-container');
    const filterPanel = document.querySelector('.filter-panel');
    const filterBtn = document.getElementById('open-filter-panel');
    const closeFilterBtn = document.getElementById('close-filter-panel');
    const clearFilterBtn = document.getElementById('clear-filters');

    // Code created by me.

    // currentUser is globally defined, therefore using currentUser over user.
    // clearFilterBtn.addEventListener("click", () => {
    //     // displayTasks(currentUser, currentUser.taskList);
    //     const checkbox = e.target.closest('input[type="checkbox"]');
    //     console.log("checkbox inside clearFilterBtn is ", checkbox);
    //     if (checkbox) {
    //         checkbox.checked =false;
    //     }
    //     closeFilterPanel();
    // });

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

    // function updateFilters() {
    //     // Collect selected filters
    //     const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value) || [];
    //     const priorityFilters = Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(cb => cb.value) || [];
    //     const timeFilters = Array.from(document.querySelectorAll('input[name="time"]:checked')).map(cb => cb.value) || [];
    //     const tagFilters = selectedFilterTags.map(tag => tag.text);
    //     console.log('Active filters:', { status: statusFilters, priority: priorityFilters, time: timeFilters, tags:tagFilters });

    //     console.log("currentUser taskList ", currentUser.taskList);

    //     // Instead of passing the filter options directly in the filterTasks function we are updating it in the appState.

    //     // const filteredTasks = filterTasks(currentUser.taskList, { status: statusFilters, priority: priorityFilters, time: timeFilters });
    //     // console.log("Filtered tasks is ", filteredTasks);

    //     appState.activeFilters = {
    //         status: statusFilters,
    //         priority: priorityFilters,
    //         time: timeFilters,
    //         tags:tagFilters
    //     };

    //     // // *** When filter is applied no pagination will exist, because we will apply filter on all tasks ***
    //     // resetPagination();

    //     // Apply sorting and filtering and update display (A function to update task display both card and list view when sorting or filtering.)
    //     refreshTaskDisplay();

    //     // ################### Part of the working and newer version of code ###########################
    //     // if (statusFilters.length === 0 && priorityFilters.length === 0 && timeFilters.length === 0) {
    //     //     // No filters selected, show all tasks
    //     //     displayTasks(currentUser, currentUser.taskList);
    //     // }
    //     // else if (filteredTasks.length === 0) {
    //     //     displayTasks(currentUser, [], "No tasks match your filters.");
    //     //     // return;
    //     // }
    //     // else {
    //     //     displayTasks(currentUser, filteredTasks);
    //     // }

    //     // ###################################################################
    //     // if (filteredTasks.length === 0){
    //     //     displayTasks(currentUser, currentUser.taskList);
    //     //     return;
    //     // }
    //     // displayTasks(currentUser, filteredTasks);
    // }

    // // Function to reset filter UI elements
    // function resetFilterUI() {
    //     document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(checkbox => {
    //         checkbox.checked = false;
    //     });

    //     // Clear app state filters
    //     appState.activeFilters = {
    //         status: [],
    //         priority: [],
    //         time: []
    //     };
    // }

    // Filter Tasks Function (Earlier functional one)

    // function filterTasks(tasks, filters) {
    //     return tasks.filter(task => {

    //         const normalizedTaskStatus = task.status.toLowerCase().trim()
    //         const normalizedTaskPriority = task.priority.toLowerCase().trim()

    //         const normalizedStatusFilters = filters.status.map(status => status.toLowerCase().trim());
    //         const normalizedPriorityFilters = filters.priority.map(priority => priority.toLowerCase().trim());

    //         const statusMatch = normalizedStatusFilters.length === 0 || normalizedStatusFilters.includes(normalizedTaskStatus);
    //         console.log("Task status:", task.status, "Normalized Task Status:", normalizedTaskStatus, "Filter statuses:", filters.status, "Normalized Filter Statuses:", normalizedStatusFilters, "statusMatch is ", statusMatch);

    //         const priorityMatch = normalizedPriorityFilters.length === 0 || normalizedPriorityFilters.includes(normalizedTaskPriority);
    //         console.log("Task priority:", task.priority, "Normalized Task priority:", normalizedTaskPriority, "Filter priority:", filters.priority, "Normalized Filter priority:", normalizedPriorityFilters, "priorityMatch is ", priorityMatch);

    //         const timeMatch = filters.time.length === 0 || checktimeFilter(task.dueDate, filters.time);
    //         console.log("timeMatch is ", timeMatch);

    //         return statusMatch && priorityMatch && timeMatch;
    //     });
    // }

    // *** Updated code for including no priority and no due date options and now using app state(not much modifiications just using filteroptions as null or chosen one.) ***
    // function filterTasks(tasks, filters) {
    // function filterTasks(tasks, filterOptions = null) {

    //     // Use provided filter options or get from app state
    //     const filters = filterOptions || appState.activeFilters;

    //     return tasks.filter(task => {
    //         // Handle status filter
    //         const normalizedTaskStatus = (task.status || '').toLowerCase().trim();
    //         const normalizedStatusFilters = filters.status.map(status => status.toLowerCase().trim());
    //         const statusMatch = normalizedStatusFilters.length === 0 ||
    //             normalizedStatusFilters.includes(normalizedTaskStatus);

    //         // Handle priority filter
    //         const normalizedTaskPriority = (task.priority || '').toLowerCase().trim();
    //         const normalizedPriorityFilters = filters.priority.map(priority => priority.toLowerCase().trim());
    //         const priorityMatch = normalizedPriorityFilters.length === 0 ||
    //             normalizedPriorityFilters.includes(normalizedTaskPriority);

    //         // Handle time filter
    //         const timeMatch = filters.time.length === 0 ||
    //             filters.time.some(timeFilter => {
    //                 // Special case for no due date
    //                 if (timeFilter === '') {
    //                     return task.dueDate === null;
    //                 }

    //                 // *** If no due date, skip other time filters (below line of code is redundant as it will never match to other time filters and will say no tasks matching this filter, so working fine.) ***
    //                 if (task.dueDate === null) return false;

    //                 // Convert to Date object if it's a string
    //                 let dateObj = task.dueDate;
    //                 if (typeof task.dueDate === 'string') {
    //                     dateObj = new Date(task.dueDate);
    //                 }

    //                 // If date is invalid, return false
    //                 if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return false;

    //                 const today = new Date();
    //                 const startOfWeek = new Date(today);
    //                 // Below code is to get start of week as sunday
    //                 // startOfWeek.setDate(today.getDate() - today.getDay());

    //                 // Below code is to get start of week as Monday
    //                 startOfWeek.setDate(today.getDate() + 1 - today.getDay());
    //                 const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    //                 switch (timeFilter) {
    //                     case 'overdue':
    //                         return dateObj < today;
    //                     case 'today':
    //                         return isToday(dateObj);
    //                     case 'this-week':
    //                         return isThisWeek(dateObj, startOfWeek);
    //                     case 'this-month':
    //                         return isThisMonth(dateObj, startOfMonth);
    //                     default:
    //                         return false;
    //                 }
    //             });

    //         return statusMatch && priorityMatch && timeMatch;
    //     });
    // }

    // // Helper functions for date comparison

    // function isToday(date) {
    //     console.log("date is ", date);
    //     const today = new Date();
    //     return date.toDateString() === today.toDateString();
    // }

    // function isThisWeek(date, startOfWeek) {
    //     const endOfWeek = new Date(startOfWeek);
    //     endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week sunday as our week is starting from Monday.
    //     console.log("endOfWeek is ", endOfWeek);
    //     return date >= startOfWeek && date <= endOfWeek;
    // }

    // function isThisMonth(date, startOfMonth) {
    //     const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
    //     // console.log("endOfMonth is ", endOfMonth);
    //     // return date >= startOfMonth && date <= endOfMonth;

    //     console.log("Checking date: ", date, "startOfMonth: ", startOfMonth, "endOfMonth: ", endOfMonth);

    //     const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
    //     const normalizedStart = new Date(startOfMonth.setHours(0, 0, 0, 0));
    //     const normalizedEnd = new Date(endOfMonth.setHours(0, 0, 0, 0));
    //     return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
    // }

    // filterBtn.addEventListener('click', openFilterPanel);
    // closeFilterBtn.addEventListener('click', closeFilterPanel);
    // Initializing the app in DOM attached event listener because it will make sure that every element of DOM is loaded before we will do anything.
    initializeApp();
});

// *** End of Filter related code/ functions ***

// --- Tag Filter Modal & Bar Interactivity ---

// 1. Get elements
// const tagFilterModal = document.getElementById('tag-filter-modal');
// const openTagFilterBtn = document.getElementById('tag-filter-btn');
// const closeTagFilterModalBtn = document.getElementById('close-tag-filter-modal');
// const applyTagFiltersBtn = document.getElementById('apply-tag-filters');
// const clearTagFiltersModalBtn = document.getElementById('clear-tag-filters-modal');

// const tagFilterBar = document.getElementById('tag-filter-bar');
// const activeFilterTags = document.getElementById('active-filter-tags');
// const editTagFiltersBtn = document.getElementById('edit-tag-filters');
// const clearAllTagFiltersBtn = document.getElementById('clear-all-tag-filters');
// const selectedFilterTags = document.getElementById('selected-filter-tags');

// // 2. Demo array for selected tags (replace with appState integration later)
// let tempSelectedTags = [];

// // 3. Open Tag Filter Modal
// openTagFilterBtn.addEventListener('click', () => {
//   tagFilterModal.style.display = 'block';
//   renderSelectedTags();
// });

// // 4. Close Modal
// closeTagFilterModalBtn.addEventListener('click', () => {
//   tagFilterModal.style.display = 'none';
// });
// applyTagFiltersBtn.addEventListener('click', () => {
//   // Show bar only if tags are selected
//   if (tempSelectedTags.length > 0) {
//     tagFilterBar.style.display = 'flex';
//     renderActiveFilterTags();
//   } else {
//     tagFilterBar.style.display = 'none';
//   }
//   tagFilterModal.style.display = 'none';
// });
// clearTagFiltersModalBtn.addEventListener('click', () => {
//   tempSelectedTags = [];
//   renderSelectedTags();
//   tagFilterBar.style.display = 'none';
//   tagFilterModal.style.display = 'none';
// });

// // 5. Tag Filter Bar
// editTagFiltersBtn.addEventListener('click', () => {
//   tagFilterModal.style.display = 'block';
//   renderSelectedTags();
// });
// clearAllTagFiltersBtn.addEventListener('click', () => {
//   tempSelectedTags = [];
//   tagFilterBar.style.display = 'none';
//   renderActiveFilterTags();
// });

// // 6. Render Functions (for demo)
// // Simulate tag selection (replace with search/autosuggest logic in next step)
// function renderSelectedTags() {
//   selectedFilterTags.innerHTML = '';
//   tempSelectedTags.forEach(tag => {
//     const pill = document.createElement('span');
//     pill.className = 'selected-tag-pill';
//     pill.textContent = tag;
//     const removeBtn = document.createElement('span');
//     removeBtn.className = 'remove-tag';
//     removeBtn.textContent = '×';
//     removeBtn.addEventListener('click', () => {
//       tempSelectedTags = tempSelectedTags.filter(t => t !== tag);
//       renderSelectedTags();
//     });
//     pill.appendChild(removeBtn);
//     selectedFilterTags.appendChild(pill);
//   });
// }

// // Render in filter bar
// function renderActiveFilterTags() {
//   activeFilterTags.innerHTML = '';
//   tempSelectedTags.forEach(tag => {
//     const pill = document.createElement('span');
//     pill.className = 'active-tag-pill';
//     pill.textContent = tag;
//     const removeBtn = document.createElement('span');
//     removeBtn.className = 'remove-tag';
//     removeBtn.textContent = '×';
//     removeBtn.addEventListener('click', () => {
//       tempSelectedTags = tempSelectedTags.filter(t => t !== tag);
//       renderActiveFilterTags();
//       if (tempSelectedTags.length === 0) tagFilterBar.style.display = 'none';
//     });
//     pill.appendChild(removeBtn);
//     activeFilterTags.appendChild(pill);
//   });
// }

// // 7. (Optional) Modal close on outside click
// window.addEventListener('click', (event) => {
//   if (event.target === tagFilterModal) {
//     tagFilterModal.style.display = 'none';
//   }
// });

// *** Tag filter related code. ***

let selectedFilterTags = []; // currently selected tags for filtering

const tagFilterModal = document.getElementById('tag-filter-modal');
const tagFilterSearch = document.getElementById('tag-filter-search');
const tagSuggestions = document.getElementById('tag-suggestions');
const selectedTagsContainer = document.getElementById('selected-filter-tags');

// Merge and deduplicate predefined + custom tags
function getAllAvailableTags() {
    // Use Set to dedupe
    // Merge by text (case-insensitive, no duplicates)
    const tagMap = new Map();

    // Add predefined first
    predefinedTags.forEach(tag => {
        tagMap.set(tag.text.toLowerCase(), tag);
    });

    console.log("predefined tags are ", predefinedTags);
    // Add/override with custom tags
    currentUser.customTags.forEach(tag => {
        tagMap.set(tag.text.toLowerCase(), tag);
    });

    console.log("custom tags are ", currentUser.customTags);

    // Return as array
    return Array.from(tagMap.values());
}

// Filter suggestions based on input and already selected chips
function getFilteredSuggestions(input) {
    const allTags = getAllAvailableTags();
    const lcInput = input.trim().toLowerCase();

    // selectedFilterTags = array of tag.text or tag.value (decide for your logic)
    return allTags.filter(tag => {
        // Not already selected (compare by text or value as you wish)
        const alreadySelected = selectedFilterTags.some(
            t => t.text === tag.text
        );
        // Matches search
        const matches = !lcInput || tag.text.toLowerCase().includes(lcInput);
        return !alreadySelected && matches;
    }).slice(0, 5);
}

function updatePlusButtonState() {
    const plusBtn = document.getElementById('open-tag-filter-panel-btn');
    if (selectedFilterTags.length >= 5) {
        plusBtn.classList.add('disabled');
        plusBtn.title = 'Max tags reached';
        plusBtn.setAttribute('tabindex', '-1');
        plusBtn.setAttribute('aria-disabled', 'true');
        plusBtn.disabled = true;
    } else {
        plusBtn.classList.remove('disabled');
        plusBtn.removeAttribute('aria-disabled');
        plusBtn.removeAttribute('tabindex');
        plusBtn.disabled = false;
    }
}

// Render chips for selected filter tags
function renderSelectedTags() {
    selectedTagsContainer.innerHTML = '';
    selectedFilterTags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'selected-tag-pill';
        pill.textContent = tag.text;
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            selectedFilterTags = selectedFilterTags.filter(t => t.text !== tag.text);
            renderSelectedTags();
            renderSuggestions(tagFilterSearch.value);
        };
        pill.appendChild(removeBtn);
        selectedTagsContainer.appendChild(pill);
    });

    // Update counter
    const counter = document.getElementById('selected-tags-counter');
    counter.textContent = `${selectedFilterTags.length}/5 tags selected`;
}


// function showTagLimitError() {
//     document.getElementById('tag-limit-error').style.display = 'block';
// }
// function hideTagLimitError() {
//     document.getElementById('tag-limit-error').style.display = 'none';
// }

// Applying tag filtes and showing its effect by refrehing
function applyTagFilters() {
    console.log("i am inside applyTagFilters");

    // appState.activeFilters.tags = selectedFilterTags.map(tag => tag.text);
    updateFilters();
    // updateFilter();
    console.log("selectedFilterTags", selectedFilterTags);

    console.log("appState.activeFilters", appState.activeFilters);
    // console.log('Active filters:', { status: statusFilters, priority: priorityFilters, time: timeFilters, tags:tagFilters });

    console.log("currentUser taskList ", currentUser.taskList);
    renderTagFilterBar();
    refreshTaskDisplay(); // Update the task list immediately!
}

// Render autosuggestions
function renderSuggestions(inputVal) {
    suggestionIndex = -1;
    const suggestions = getFilteredSuggestions(inputVal);
    tagSuggestions.innerHTML = '';

    // Hide suggestions and show error if already 5 selected
    if (selectedFilterTags.length >= 5) {
        tagSuggestions.style.display = 'none';
        // showTagLimitError();
        return;
    }

    tagSuggestions.innerHTML = '';
    // hideTagLimitError(); // Hide error if user goes below 5

    if (suggestions.length === 0) {
        tagSuggestions.innerHTML = `<div class="tag-suggestion-item" style="color:#888;cursor:default;">No such tag exists</div>`;
        tagSuggestions.style.display = 'block';
        return;
    }
    suggestions.forEach(tag => {
        const item = document.createElement('div');
        item.className = 'tag-suggestion-item';
        item.textContent = tag.text;
        item.onclick = () => {
            if (selectedFilterTags.length < 5) {
                selectedFilterTags.push(tag);
                tagFilterSearch.value = '';
                renderSelectedTags();
                renderSuggestions('');
                tagSuggestions.style.display = 'none';// Close dropdown after select
                updatePlusButtonState();
            }
        };
        tagSuggestions.appendChild(item);
    });
    tagSuggestions.style.display = suggestions.length > 0 ? 'block' : 'none';
}

// Events
tagFilterSearch.addEventListener('input', (e) => {
    renderSuggestions(e.target.value);
});

// Hide suggestions dropdown if input loses focus (optional, can be improved for keyboard nav)
tagFilterSearch.addEventListener('blur', () => {
    setTimeout(() => tagSuggestions.style.display = 'none', 150);
});
tagFilterSearch.addEventListener('focus', () => {
    renderSuggestions(tagFilterSearch.value);
});

let suggestionIndex = -1; // Keeps track of keyboard selection

tagFilterSearch.addEventListener('keydown', function (e) {
    const visibleSuggestions = Array.from(tagSuggestions.querySelectorAll('.tag-suggestion-item'))
        .filter(item => !item.style.color); // skip "No such tag exists"
    if (visibleSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
        suggestionIndex = (suggestionIndex + 1) % visibleSuggestions.length;
        updateSuggestionHighlight(visibleSuggestions);
        e.preventDefault();
    }
    else if (e.key === 'ArrowUp') {
        suggestionIndex = (suggestionIndex - 1 + visibleSuggestions.length) % visibleSuggestions.length;
        updateSuggestionHighlight(visibleSuggestions);
        e.preventDefault();
    }
    else if (e.key === 'Enter' || e.key === 'Tab') {
        if (suggestionIndex >= 0 && suggestionIndex < visibleSuggestions.length) {
            visibleSuggestions[suggestionIndex].click();
        } else if (visibleSuggestions.length > 0) {
            visibleSuggestions[0].click();
        }
        suggestionIndex = -1;
        e.preventDefault();
    }
    else {
        suggestionIndex = -1;
        updateSuggestionHighlight(visibleSuggestions);
    }
});

function updateSuggestionHighlight(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('active', idx === suggestionIndex);
    });
}

// Modal open: reset input and suggestions
function openTagFilterModal() {
    tagFilterModal.style.display = 'block';
    tagFilterSearch.value = '';
    renderSelectedTags();
    // renderSuggestions('');
    tagSuggestions.style.display = 'none'; // Hide suggestions initially
}

document.getElementById('apply-tag-filters').onclick = () => {
    tagFilterModal.style.display = 'none';

    // Now calling this function because it will refresh the task cards display along with rendering tag filter bar.
    applyTagFilters();
    // Render tag filter bar with active tags
    // renderTagFilterBar();
};

// Open Modal with + button
document.getElementById('open-tag-filter-panel-btn').onclick = openTagFilterModal;

// Clear all tags in bar
document.getElementById('clear-all-tag-filters').onclick = function () {
    selectedFilterTags = [];
    // renderTagFilterBar();
    applyTagFilters();
    // Also clear tag filtering in your app logic here! -> LET SEE WHAT DOES IT MEAN
};

// Render filter bar chips
function renderTagFilterBar() {
    const barTags = document.getElementById('filter-bar-tags');
    barTags.innerHTML = '';
    selectedFilterTags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'filter-bar-chip';
        const text = document.createElement('span');
        text.textContent = tag.text;
        // pill.textContent = tag.text;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-tag';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            selectedFilterTags = selectedFilterTags.filter(t => t.text !== tag.text);
            applyTagFilters();

            // renderTagFilterBar();
            // I don't know why we added this suggestion code here, because in renderTagFilterBar, what's the point of talking about suggestions.
            // tagSuggestions.style.display = 'none';
            // Don't know what is this renderSUggestoins do
            // renderSuggestions(tagFilterSearch.value);
            updatePlusButtonState();
            // Also clear tag filtering in your app logic here!
        };
        pill.appendChild(text);
        pill.appendChild(removeBtn);
        barTags.appendChild(pill);
    });
    // Hide bar if no tags
    // document.getElementById('tag-filter-bar').style.display = selectedFilterTags.length ? 'flex' : 'none';

    console.log("Knowing hte number of tags in tag filter bar, so that can control the visibility of tag filter bar when there is no tag.", selectedFilterTags.length);
    const bar = document.getElementById('tag-filter-bar');
    bar.style.display = selectedFilterTags.length ? 'flex' : 'none';
    updatePlusButtonState();
}

// Closing the dropdown when click anywehre in modal
// Click-away handler
document.addEventListener('mousedown', (e) => {
    if (!tagFilterModal.contains(e.target)) {
        tagSuggestions.style.display = 'none';
    }
});

document.getElementById('tag-filter-btn').onclick = openTagFilterModal;

// Modal close (hook to your close button)
document.getElementById('close-tag-filter-modal').onclick = () => {
    tagFilterModal.style.display = 'none';
    tagSuggestions.style.display = 'none';
};

// Apply/clear logic
// document.getElementById('apply-tag-filters').onclick = () => {
//     tagFilterModal.style.display = 'none';
//     renderTagFilterBar();
//     // TODO: perform actual filtering and show bar (next step)
// };
document.getElementById('clear-tag-filters-modal').onclick = () => {
    selectedFilterTags = [];
    renderSelectedTags();
    // renderTagFilterBar();
    applyTagFilters();
    tagFilterModal.style.display = 'none';
};

/* End of filter tag modal and bar code */

// *** Sorting functionality ***

// I can change the function name.
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
                // console.log("taskA createdAt date is ", taskA.created_at);
                // console.log("taskB createdAt date is ", taskB.created_at);
                // Defensive check for createdAt
                const dateA = taskA.created_at ? new Date(taskA.created_at) : new Date(0);
                const dateB = taskB.created_at ? new Date(taskB.created_at) : new Date(0);
                // console.log("dateA inside newest first is ", dateA);
                // console.log("dateB inside newest first is ", dateB);
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

        // ##########################################################################################
        // case "dueDateAsc":
        //     sortFunc = (taskA, taskB) => {
        //         if (!taskA.dueDate && !taskB.dueDate) return 0;
        //         if (!taskA.dueDate) return 1; // Tasks with no due date last
        //         if (!taskB.dueDate) return -1;
        //         console.log("dueDate is of ",taskA.task, "in asc order ", taskA.dueDate);
        //         console.log("dueDate is of ",taskB.task, "in asc order ", taskB.dueDate);

        //         return new Date(taskB.dueDate) - new Date(taskA.dueDate);
        //         // return new Date(taskA.dueDate) - new Date(taskB.dueDate);
        //     };
        //     break;

        // case "dueDateDesc":
        //     sortFunc = (taskA, taskB) => {
        //         if (!taskA.dueDate && !taskB.dueDate) return 0;
        //         if (!taskA.dueDate) return -1; // Tasks with no due date first
        //         if (!taskB.dueDate) return 1;
        //         console.log("dueDate is of ",taskA.task, "in desc order ", taskA.dueDate);
        //         console.log("dueDate is of ",taskB.task, "in desc order ", taskB.dueDate);
        //         return new Date(taskA.dueDate) - new Date(taskB.dueDate);
        //         // return new Date(taskB.dueDate) - new Date(taskA.dueDate);
        //     };
        //     break;

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
        //############################################################################

        // case "dueDateAsc":
        //     sortFunc = (taskA, taskB) => {
        //         if (!taskA.dueDate && !taskB.dueDate) return 0;
        //         if (!taskA.dueDate) return 1;
        //         if (!taskB.dueDate) return -1;
        //         const dateA = new Date(taskA.dueDate);
        //         const dateB = new Date(taskB.dueDate);
        //         console.log(`Comparing (Asc): ${taskA.task} (${dateA}) vs ${taskB.task} (${dateB}) -> ${dateA - dateB}`);
        //         return dateA - dateB;
        //     };
        //     break;

        // case "dueDateDesc":
        //     sortFunc = (taskA, taskB) => {
        //         if (!taskA.dueDate && !taskB.dueDate) return 0;
        //         if (!taskA.dueDate) return -1;
        //         if (!taskB.dueDate) return 1;
        //         const dateA = new Date(taskA.dueDate);
        //         const dateB = new Date(taskB.dueDate);
        //         console.log(`Comparing (Desc): ${taskA.task} (${dateA}) vs ${taskB.task} (${dateB}) -> ${dateB - dateA}`);
        //         return dateB - dateA;
        //     };
        //     break;

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
            // Updated taskList

            // Handle Update
            // const taskIndex = currentUser.taskList.findIndex(task => task.task_id === editTaskId);
            // if (taskIndex !== -1) {
            //     currentUser.taskList[taskIndex] = { ...currentUser.taskList[taskIndex], ...formData };
            //     localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
            //     alert("Task updated successfully!");
            // }

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

                // const taskk = currentUser.taskList.filter(task => task.task_id = editTaskId);
                // console.log("TaskExist checking for removing date and hence removing notification is ", taskk);
                // // ********************************************************************************************************
                // // *** If date is removed then remove the reminder instead of updating its due date or so ***
                // if (taskk.dueDate === null){
                //     // removeReminderBtn.click();
                //     removeReminderBtn.addEventListener('click',() => {
                //         if (editTaskId) {
                //             removeTaskReminder(editTaskId);
                //             currentReminderTaskId = null;
                //             customInputTouched = false; // Reset flag on reminder removal
                //             updateBellIcon(editTaskId);
                //         }
                //     });
                //     refreshTaskDisplay();
                // }

                // Task list
                let user_task_ls = currentUser["taskList"];
                // alert("Task updated successfully!");
                // showSuccess('Task updated successfully');
                console.log("Calling the sorting function when updating a task.");
                // sorting(); -> No more needed as we are integrating everything properly

                // displayTasks(currentUser, user_task_ls);
                // refreshTaskDisplay();


                // localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
                // showSuccess('Task updated successfully');
                // modal.style.display = "none";
                // const notification = dbStorageInstance.getNotificationByTaskId(editTaskId);
                // console.log("Notification to update is ", notification);

                // console.log("We are updating the notification data now.");
                // notification.dueDate = formData.dueDate;
                // notification.task = formData.task;
                // notification.priority = formData.priority;
                // await dbStorageInstance.updateNotification(notification);
                // console.log("Notification data updated successfully on updating the task to the database.");



                // clearModalForm();

                // // dbStorageInstance.updateNotification(currentUser.notifications);
                // // Task list
                // // let user_task_ls = currentUser["taskList"];
                // // alert("Task updated successfully!");
                // // showSuccess('Task updated successfully');
                // displayTasks(currentUser, user_task_ls);

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
        // sorting();
        // displayTasks(currentUser, user_task_ls);
        refreshTaskDisplay();
        // ###########################################################
        // displayTasks(currentUser, currentUser.taskList);
        // addCheckboxListeners();
    }
    catch (error) {
        showFormErrors([error.message], 'task-form');
    }

}

// Delete functionality related code

// function initializeDeletion() {
//     window.deletionManager = new DeletionManager();

//     window.deletionManager.setupTaskCheckboxes();

//     // this is for making calling the change event on selecting last task,which was not happening before, basically event listener wasn't getting attached to last task,don't know why.
//     document.querySelector("#task-display").addEventListener("change", (event) => {
//         if (event.target.classList.contains("task-checkbox")) {
//             window.deletionManager.handleCheckboxChange(event);
//         }
//     });

//     // Add event listener to custom event(for our special case.)
//     document.addEventListener("deleteTasks", (event) => {
//         // Using destructuring to get taskIds
//         const { taskIds } = event.detail;
//         console.log("Received taskIds in app.js: ", taskIds);

//         if (taskIds && taskIds.size > 0) {
//             // We can access deleteTask, it will work.
//             const deletionSuccessful = currentUser.deleteTask(taskIds);

//             if (deletionSuccessful) {

//                 console.log("Tasks deleted successfully.");
//                 localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
//                 let user_task_ls = currentUser["taskList"];
//                 displayTasks(currentUser, user_task_ls);


//                 // ✅ Clear selection and hide modal directly
//                 window.deletionManager.clearSelectionState();
//                 document.getElementById("delete-modal").style.display = "none";
//             }
//         }
//     });
// }



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

                // *** Deleting it like this is wrong, because we can have multiple tasks to delete or even the single task came in array or set, so we need to iterate it to delete all the notifications. ***

                // Deleting the notification from the indexedDB after successful deletion of task from local storage.

                // const notification = await dbStorageInstance.getNotificationByTaskId(taskIds);
                // await dbStorageInstance.deleteNotification(notification.id);
                // console.log("Notification deleted successfully from the indexedDB on deleting the task from local storage.");

                // Iterating over the taskIds and deleting the notification from the indexedDB.

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
                // displayTasks(currentUser, currentUser.taskList);
                // For showing the correct order of tasks even when applying sorting or not applying sorting, refreshTaskDisplay() is a safer option.
                refreshTaskDisplay();

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

        // 2. Find the user and the task in your application state
        // const user = findUserByTaskId(taskId); // Implement this function
        // const task = findTaskById(user, taskId); // Implement this function


        // const user = userList.find(user => user.username === username);
        // console.log("User found after clicking the sysmtem notification is ", user);
        // const task = user.taskList.find(task => task.task_id === taskId);
        // console.log("Task found after clicking the sysmtem notification is ", task);

        // if (task) {
        //     // 3. Bring the task into focus in your UI
        //     focusTaskInUI(task); // Implement this function to scroll and show the task

        //     // 4. Highlight the task
        //     highlightTask(taskId);

        //     // 5. (Optional) Close the notification center

        //     // I don't think that here we  need to close the notification center as we are not opening it. (user might had opened the notification center, because systmem notification can be anytime.)

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
    console.log("focusing the task in UI.");
    const taskElement = document.querySelector(`[data-task-id="${task.task_id}"]`);
    if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // taskElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        console.log("Focused on task:", task.task);
    }
    else {
        console.log("Task element not found in DOM:", task.task_id);
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

// Attaching event listener to DOM for sorting related code.
// document.addEventListener('DOMContentLoaded', () => {
//         // Add event listeners to the sort dropdown
//         const sortDropdown = document.querySelector('.sort-container select');
//         if (sortDropdown) {
//             // Remove any existing event listeners
//             sortDropdown.removeEventListener('change', onSortChange);

//             // Add our new event listener
//             sortDropdown.addEventListener('change', onSortChange);
//         }
// });

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

    // // *** In sorting is applied then no pagination  ***
    // resetPagination();
    // Refresh task display
    refreshTaskDisplay();
}

// // Function to call after submitting the task form (add/edit) -> NOT NEEDED DIRECTLY CALLING IT WHEREVER NEEDED
// function onTaskFormSubmit() {
//     // This should be called after successfully saving a task
//     window.onTaskModified();
// }

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

// initializeApp();
