// // // export function sum(a,b){
// // //     return a+b;
// // // }

// // // document.getElementById("demo").innerHTML = sum(5,6);
// // import { handleFormSubmit } from "./ui.js";
// // import {User } from "./data.js";

// // const userList = [];
// // document.getElementById("submitBtn").addEventListener("click",()=>{
// //     // const userList = []; // It needed to create outside of the function, otherwise it will get created again and again.
// //     const {name, email} = handleFormSubmit();

// //     let newUser = None;
// //     if (userList.length){
// //         userList.forEach((user_obj) => {

// //             if(user_obj["email"] != email){
// //                 // Create user only if it doesn't exist.
// //                 newUser = new User(name, email);
// //                 // userList.push(newUser);
// //                 const list = JSON.parse(localStorage.getItem("userList"));
// //                 list.push(newUser);
// //             }
// //         });
// //     }
// //     else{
// //         // For the case when there is zero users exist.
// //         newUser = new User(name, email);

// //         // Instead of adding it in the array, we should add it in the browser array.
// //         // converting the string into an array
// //         const list = JSON.parse(localStorage.getItem("userList") );
// //         list.push(newUser);

// //         // userList.push(newUser);
// //     }


// //     // I need to find the right place for userList variable, so that things won't repeated or get cluttered.

// //     // This is for the case when userList array is not added to the local storage.

// //     if(! localStorage.getItem("userList")){
// //         console.log("I am inside if statment for adding users.")
// //         localStorage.setItem("userList",JSON.stringify(userList));
// //     }

// //     // just for checking
// //     console.log(newUser);
// // });

// // // displaying the user from the local storage (userList) and adding the constraint of not adding the user if it is already exist, basically will check the email of the existing object, if exist then we will say no, you can't take it.
// // // and we will also have to prevent userList in local storage if already exist.

// // // This is for showing dropdown only if any user exist in userList.
// // // It basically return null if no user exist, which is equal to 0(maybe), so no need to check the length of the array, in order to verify whether user exists or not.
// // if (! JSON.parse(localStorage.getItem("userList"))){
// //     dropdown_options = document.getElementById("choose-user");
// //     dropdown_options.addEventListener("change", ()=> {
// //         const select_options = JSON.parse(localStorage.getItem("userList"));

// //     });
// // }
// // else{
// //     document.getElementById("user-dropdown").style.display = "none";
// // }


// // ##############################


// // import { handleFormSubmit, handleTaskData } from "./ui.js";    
// // import {User} from "./data.js";

// // const userList = JSON.parse(localStorage.getItem("userList")) || [];

// // document.getElementById("submitBtn").addEventListener("click" , (event)=>{
// //     // Prevent automatic submission on loading.
// //     event.preventDefault();
// //     const {name, email} = handleFormSubmit();

// //     if( !name || !email){
// //         alert("Please fill out all required fields.");
// //         return;
// //     }
// //     const existingUser = userList.find(user => user.email === email);

// //     if(!existingUser){

// //         // Create the user
// //         const newUser = new User(name, email);
// //         userList.push(newUser);
// //         localStorage.setItem("userList", JSON.stringify(userList));
// //         alert("New user added: ", newUser);
// //         // Clearing the form fields.
// //         document.getElementById("user-data").reset();
// //     }

// //     else{
// //         alert("User with this email already exists: ", email);
// //     }
// // })

// // // Allowing the user choose option to display, only if any user exist, otherwise hide this option.
// // let currentUser = null;
// // // Hide the choose option
// // if(!userList.length){
// //     document.getElementById("user-dropdown").style.display = "none";
// // }
// // // Display the user choose option
// // else{
// //     const dropdown = document.getElementById("choose-user");
// //     userList.forEach((user, index ) => {

// //         // Its for displaying the options 
// //         const optionElement = document.createElement('option');
// //         optionElement.value = index
// //         optionElement.textContent = user["username"];

// //         dropdown.appendChild(optionElement);

// //     } );
// //         //  A trigger for allowing the chosen user to create tasks.
// //         dropdown.addEventListener("change",() => {
// //             // currentUser = user;
// //             // console.log("userr is ", user);
// //             // console.log("currentUser is ", currentUser + "is instance of User: ", currentUser instanceof User);
// //             // Hiding the user creation form.
// //             // document.getElementById("user-data").style.display = "none";
// //             // Hiding the user-selection dropdown container
// //             // document.getElementById("user-dropdown").style.display = "none";

// //             // Hiding the home page itself and showing user profile
// //             // document.getElementById("home-page").style.display = "none";
// //             // // showing the profile page
// //             // document.getElementById("user-profile").style.display = "block";

// //             // const element = document.getElementById("user-profile");
// //             // const para = element.querySelector("p");
// //             // const user_obj = document.createElement("h1");
// //             // user_obj.textContent = `Hi ${user["username"]}!`;
// //             // para.appendChild(user_obj);

// //             const selectedIndex = dropdown.value;
// //             currentUser = userList[selectedIndex];

// //             document.getElementById("home-page").style.display = "none";
// //             document.getElementById("user-profile").style.display = "block";

// //             const element = document.getElementById("user-profile");
// //             const para = element.querySelector("p");

// //             para.innerHTML = '';
// //             const user_obj = document.createElement("h1");
// //             user_obj.textContent = `Hi ${currentUser["username"]}!`;
// //             para.append(user_obj);
// //         }
// //     );

// // }

// // // Handling task addition


// // document.getElementById("add-task").addEventListener("click", (event) => {
// //     event.preventDefault();
// //     const {task} = handleTaskData();

// //     if (!task){
// //         alert("Please add a task.");
// //         return;
// //     }


// //     // const existingTask = task_list.find(existing_task => existing_task === task ); // Wrong code
// //     // Here currentUser.taskList basically access the taskList array, and then existingTask represents task objects, so from existingTask, we are trying to get the task by using existingTask.task.
// //     currentUser = User.fromJSON(currentUser); // Rehydration
// //     const existingTask = currentUser.taskList.find(existingTask => existingTask.task === task);
// //     console.log("existingTask: " + existingTask);

// //     if(!existingTask){
// //         // const current_user = User.fromJSON(currentUser);
// //         console.log("currentUser is ", currentUser + "is instance of User: ", currentUser instanceof User);
// //         console.log("task is ", task);
// //         currentUser.addTasks(task);
// //         alert("Task created successfully.");

// //     }
// //     else{
// //         alert("Task already exist.Try adding another task!");
// //     }

// // });

// // // For displaying the tasks
// // document.getElementById("view-task").addEventListener("click",()=>{

// // });

// // document.getElementById("back-to-home").addEventListener("click",()=>{
// //     document.getElementById("home-page").style.display = "block";
// //     document.getElementById("user-profile").style.display = "none";
// // });


// // ################################################################
// import { handleFormSubmit,handleTaskData } from "./ui.js";
// import {User} from "./data.js";
// // import {User, StorageProxy } from "./data.js";
// import { PageManager } from "./navigation.js";

// const userListKey = 'userList';
// const userMap = new Map();

// // Load from local storage and populate the userMap
// const storedUsers = JSON.parse(localStorage.getItem(userListKey)) || [];
// storedUsers.forEach(userData => {
//     const user = User.fromData(userData);
//     userMap.set(user.email, user);
// });
// let userList = Array.from(userMap.values()); // Create userList from userMap

// let currentUser = null;
// const pageManager = new PageManager();

// // Updating user dropdown
// function updateUserDropdown(){
//     const dropdown = document.getElementById("choose-user");
//     const userDropdownContainer = document.getElementById("user-dropdown");

//     // If no user exist, then don't show the dropdwon.
//     if(!userList.length){
//         userDropdownContainer.style.display = "none";
//         return;
//     }

//     dropdown.innerHTML = '<option value="" disabled selected> Choose an option</option>';
//     userDropdownContainer.style.display = "block";
//     userList.forEach((user, index) => {
//         const optionElement = document.createElement('option');
//         optionElement.value = index;
//         optionElement.textContent = user.username;
//         dropdown.appendChild(optionElement);
//     }
// );

// }

// // Choosing user from user selection dropdown.
// function handleUserSelection(event){
//     const selectedIndex = event.target.value;
//     console.log("selectedIndex is", selectedIndex);
//     currentUser = userList[selectedIndex];

//     updateProfileView(currentUser);
//     const task_dropdown = document.getElementById("view-task");
//     pageManager.showPage('profile');
//     displayTasks(currentUser);
// }

// // Basically updating the profile data after showing the profile page.
// function updateProfileView(user){
//     const para = document.querySelector("#user-profile p");
//     para.innerHTML = '';
//     const user_obj = document.createElement("h1");
//     user_obj.textContent = `Hi ${user.username}!`;
//     para.appendChild(user_obj);
// }

// function displayTasks(user){
//     const ele = document.querySelector("#task-display ol");
//     const user_task_ls = user["taskList"];
//     ele.innerHTML = '';
//     for(const task of user_task_ls){
//         const li = document.createElement("li");
//         for(const prop in task){
//             if(prop == "task"){
//                 li.textContent = task[prop];
//                 break;
//             }
//         }
//         ele.appendChild(li);
//     }
// }

// function handleBackToHome(){
//     pageManager.showPage('home');
//     currentUser = null;
//     updateUserDropdown();

// }



// function setupEventListeners(){
//     document.getElementById("submitBtn").addEventListener("click", (event) => {
//         event.preventDefault();
//         const {name, email } = handleFormSubmit();

//         if (!name || !email){
//             alert("Please fill out all required fields.");
//             return;
//         }

//         // Checking that user exists or not, if not then we will add one.
//         if(!userMap.has(email)){
//             const newUser = new User(name, email);
//             userMap.set(email,newUser);
//             updateUserDropdown();
//             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
//             updateUserDropdown();
//             alert("New user added successfully");
//             document.getElementById("user-data").reset();
//         }
//         else{
//             alert(`User with email ${email} already exists.`);
//         }
//     });



//     // User selection
//     document.getElementById("choose-user").addEventListener("change", handleUserSelection);

//     // Task addition
//     document.getElementById("add-task").addEventListener("click",(event) => {
//         event.preventDefault();
//         const {task, description, priority , status, dueDate} = handleTaskData();

//         if (!task){
//             alert("Please add a task");
//             return;
//         }

//         if(!dueDate){
//             alert("Please add a due Date");
//             return;
//         }

//         console.log("task is ",task, "<br> description is ", description, "<br> priority is ", priority, "<br> status is ",status,"<br> dueDate is ",dueDate )
//         const existingTask = currentUser.taskList.find(existingTask =>
//             existingTask.task === task );

//         if (!existingTask){

//             // currentUser.addTasks(task);
//             currentUser.addTasks(task,description,status,priority,dueDate);

//             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
//             displayTasks();
//             alert("Task created successfully.");
//             document.getElementById("task-creation").reset();
//         }
//         else{
//             alert("Task already exists. Try adding another task!");
//         }
//     });


//     document.getElementById("back-to-home").addEventListener("click", handleBackToHome);
// }



// // Initialize the application
// function initializeApp(){
//     updateUserDropdown();
//     setupEventListeners();
//     pageManager.showPage('home');
// }

// initializeApp();

// // ##################################################
// // import { handleFormSubmit,handleTaskData } from "./ui.js";
// // import {User, StorageProxy } from "./data.js";
// // import { PageManager } from "./navigation.js";

// // const userList = new StorageProxy([], 'userList');
// // let currentUser = null;
// // const pageManager = new PageManager();

// // // Updating user dropdown
// // function updateUserDropdown(){
// //     const dropdown = document.getElementById("choose-user");
// //     const userDropdownContainer = document.getElementById("user-dropdown");

// //     // If no user exist, then don't show the dropdwon.
// //     if(!userList.length){
// //         userDropdownContainer.style.display = "none";
// //         return;
// //     }

// //     dropdown.innerHTML = '<option value="" disabled selected> Choose an option</option>';
// //     userDropdownContainer.style.display = "block";
// //     userList.forEach((user, index) => {
// //         const optionElement = document.createElement('option');
// //         optionElement.value = index;
// //         optionElement.textContent = user.username;
// //         dropdown.appendChild(optionElement);
// //     }
// // );

// // }

// // // Choosing user from user selection dropdown.
// // function handleUserSelection(event){
// //     const selectedIndex = event.target.value;
// //     currentUser = userList[selectedIndex];

// //     updateProfileView(currentUser);
// //     pageManager.showPage('profile');
// // }

// // // Basically updating the profile data after showing the profile page.
// // function updateProfileView(user){
// //     const para = document.querySelector("#user-profile p");
// //     para.innerHTML = '';
// //     const user_obj = document.createElement("h1");
// //     user_obj.textContent = `Hi ${user.username}!`;
// //     para.appendChild(user_obj);
// // }

// // function handleBackToHome(){
// //     pageManager.showPage('home');
// //     currentUser = null;
// //     updateUserDropdown();

// // }

// // function setupEventListeners(){
// //     document.getElementById("submitBtn").addEventListener("click", (event) => {
// //         event.preventDefault();
// //         const {name, email } = handleFormSubmit();

// //         if (!name || !email){
// //             alert("Please fill out all required fields.");
// //             return;
// //         }

// //         const existingUser = userList.find(user => user.email === email);

// //         if(!existingUser){
// //             const newUser = new User(name, email);
// //             userList.push(newUser);
// //             alert("New user added successfully");
// //             document.getElementById("user-data").reset();

// //             updateUserDropdown();
// //         }else{
// //             alert(`User with email ${email} already exists.`);
// //         }
// //     });

// //     // User selection
// //     document.getElementById("choose-user").addEventListener("change", handleUserSelection);

// //     // Task addition
// //     document.getElementById("add-task").addEventListener("click",(event) => {
// //         event.preventDefault();
// //         const {task} = handleTaskData();

// //         if (!task){
// //             alert("Please add a task");
// //             return;
// //         }

// //         const existingTask = currentUser.taskList.find(existingTask =>
// //             existingTask.task === task );

// //         if (!existingTask){
// //             currentUser.addTasks(task);
// //             alert("Task created successfully");
// //             document.getElementById("task-creation").reset();
// //         }
// //         else{
// //             alert("Task already exists. Try adding another task!");
// //         }
// //     });

// //     document.getElementById("back-to-home").addEventListener("click", handleBackToHome);
// // }



// // // Initialize the application
// // function initializeApp(){
// //     updateUserDropdown();
// //     setupEventListeners();
// //     pageManager.showPage('home');
// // }

// // initializeApp();

// // #################################################
// // import { handleFormSubmit, handleTaskData } from "./ui.js";
// // import { User,Task } from "./data.js";
// // import { PageManager } from "./navigation.js";

// // const userList = []; // Replace with StorageProxy for future enhancements
// // let currentUser = null;
// // const pageManager = new PageManager();

// // // Choosing user from user selection dropdown (modify based on your implementation)
// // function handleUserSelection(event) {
// //   // Implement logic to choose user from dropdown and update currentUser
// // }

// // function updateProfileView(user) {
// //   // Update profile view based on user data
// // }

// // function handleBackToHome() {
// //   // Handle going back to home page
// // }

// // function setupEventListeners() {
// //   document.getElementById("submitBtn").addEventListener("click", (event) => {
// //     event.preventDefault();
// //     const { name, email } = handleFormSubmit();

// //     if (!name || !email) {
// //       alert("Please fill out all required fields.");
// //       return;
// //     }

// //     const existingUser = userList.find(user => user.email === email);

// //     if (!existingUser) {
// //       const newUser = new User(name, email);
// //       userList.push(newUser);
// //       alert("New user added successfully");
// //       document.getElementById("user-data").reset();

// //       // Update user list for dropdown (if applicable)
// //     } else {
// //       alert(`User with email ${email} already exists.`);
// //     }
// //   });

// //   // User selection
// //   // document.getElementById("choose-user").addEventListener("change", handleUserSelection);

// //   // Task addition (not implemented yet)

// //   document.getElementById("back-to-home").addEventListener("click", handleBackToHome);
// // }

// // function initializeApp() {
// //   // Load user data from local storage (if using StorageProxy in the future)
// //   // updateUserDropdown(); // Update user list for dropdown (if applicable)
// //   setupEventListeners();
// //   PageManager.showPage('home');
// // }

// // initializeApp();

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

// Populate user list and also handling switching of user.

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
            currentUser = userList[index];
            // Initializing all the modules that use currentUser or injecting currenUser to the modules that depend on it.(Applying dependency injection design pattern.)
            // Call a function to initialize dependent modules
            initializeModules(currentUser);

            updateProfileView(currentUser);
            // Reset the view toggle to see the correct name either dashboard or view all tasks
            resetViewToggle();
            pageManager.showPage('profile');
            // const func = setupModalHandlers();
            // func.displayTasks(currentUser);
            sorting();
            displayTasks(currentUser, currentUser["taskList"]);
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
        // Set initial state
        viewAllButton.dataset.viewMode = "card";
        viewToggleIcon.textContent = "view_list"; // Initial icon for switching to list view
        viewToggleText.textContent = "View All Tasks";

        viewAllButton.addEventListener("click", function () {
            const currentView = this.dataset.viewMode;
            const newView = currentView === "card" ? "list" : "card";

            // Update button text
            // this.textContent = newView === "card" ? "View All Tasks" : "Dashboard";

            // Update button text and icon
            if (newView === "card") {
                viewToggleIcon.textContent = "view_list"; // Show list icon (next state)
                viewToggleText.textContent = "View All Tasks";
            } else {
                viewToggleIcon.textContent = "view_module"; // Show card icon (next state)
                viewToggleText.textContent = "Dashboard";
            }
            this.dataset.viewMode = newView;

            // Re-render tasks with new view mode
            displayTasks(currentUser, currentUser.taskList, "", newView);
        });
    }
}

function resetViewToggle() {
    const viewAllButton = document.querySelector(".view-all-button");
    const viewToggleIcon = viewAllButton.querySelector('i');
    const viewToggleText = viewAllButton.querySelector('span');

    if (viewAllButton) {
        // Reset to card view
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

// #################################################################################################
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

                // Switch to card view and focus the task
                displayTasks(currentUser, currentUser.taskList, "", "card", taskId);
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



const searchInput = document.querySelector(".search-container input");
const debouncedSearch = _.debounce(() => {
    const inputValue = searchInput.value.trim();
    if (inputValue === "") {
        displayTasks(currentUser, currentUser.taskList);
        return; // Exit early to avoid unnecessary filtering
    }

    const escapedInput = inputValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedInput, "i");
    // const regex = new RegExp(inputValue, "i");
    const searchTaskList = currentUser.taskList.filter(task =>
        regex.test(task.task) || regex.test(task.description)
    );


    if (inputValue !== "" && searchTaskList.length === 0) {
        displayTasks(currentUser, [], "No tasks match your search.")
    } else {
        displayTasks(currentUser, searchTaskList);
    }

}, 200);

searchInput.addEventListener("input", debouncedSearch);

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

//***  Handling filter operation. ***

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

document.addEventListener('DOMContentLoaded', () => {
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

    clearFilterBtn.addEventListener("click", () => {
        document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        updateFilters();
        closeFilterPanel();

    });



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
        // Collet selected filters
        const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value) || [];
        const priorityFilters = Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(cb => cb.value) || [];
        const timeFilters = Array.from(document.querySelectorAll('input[name="time"]:checked')).map(cb => cb.value) || [];

        console.log('Active filters:', { status: statusFilters, priority: priorityFilters, time: timeFilters });
        console.log("currentUser taskList ", currentUser.taskList);
        const filteredTasks = filterTasks(currentUser.taskList, { status: statusFilters, priority: priorityFilters, time: timeFilters });
        console.log("Filtered tasks is ", filteredTasks);

        if (statusFilters.length === 0 && priorityFilters.length === 0 && timeFilters.length === 0) {
            // No filters selected, show all tasks
            displayTasks(currentUser, currentUser.taskList);
        }
        else if (filteredTasks.length === 0) {
            displayTasks(currentUser, [], "No tasks match your filters.");
            // return;
        }
        else {
            displayTasks(currentUser, filteredTasks);
        }

        // if (filteredTasks.length === 0){
        //     displayTasks(currentUser, currentUser.taskList);
        //     return;
        // }
        // displayTasks(currentUser, filteredTasks);
    }

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

    // *** Updated code for including no priority and no due date options ***
    function filterTasks(tasks, filters) {
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
                    // if (task.dueDate === null) return false;

                    // Convert to Date object if it's a string
                    let dateObj = task.dueDate;
                    if (typeof task.dueDate === 'string') {
                        dateObj = new Date(task.dueDate);
                    }

                    // If date is invalid, return false
                    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return false;

                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() + 1 - today.getDay());
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                    switch(timeFilter) {
                        case 'overdue': return dateObj < today;
                        case 'today': return isToday(dateObj);
                        case 'this-week': return isThisWeek(dateObj, startOfWeek);
                        case 'this-month': return isThisMonth(dateObj, startOfMonth);
                        default: return false;
                    }
                });

            return statusMatch && priorityMatch && timeMatch;
        });
    }

// Non functional code(commented out from before.)
    // function filterTasks(tasks, filters) {
    //     return tasks.filter(task => {
    //         const statusMatch = filters.status.length === 0 || filters.status.includes(task.status);
    //         console.log("statusMatch is ", statusMatch);
    //         console.log("status which are included: ", filters.status.includes(task.status));
    //         const priorityMatch = filters.priority.length === 0 || filters.priority.includes(task.priority);

    //         console.log("priorityMatch is ", priorityMatch);
    //         console.log("Filters which are included: ", filters.priority.includes(task.priority));

    //         const timeMatch = filters.time === 0 || checktimeFilter(task.dueDate, filters.time);
    //         console.log("timeMatch is ", timeMatch);
    //         return statusMatch && priorityMatch && timeMatch;
    //     });
    // }


    // *** Now handling this checktimeFilter code in the filterTasks function itself, there we are also handling the no dueDate case. So this function is no more of use. ***
    // function checktimeFilter(dueDate, timeFilters) {
        
    //     // If timeFilters is empty, return true
    //     if (timeFilters.length === 0) return true;
    //     console.log("dueDate is ", dueDate);
    //     // Convert string dueDate to Date object if it's a string
    //     let dateObj = dueDate;
    //     if (typeof dueDate === 'string') {
    //         dateObj = new Date(dueDate);
    //     }

    //     // If date is invalid, return false
    //     if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return false;

    //     // if (isNaN(dateObj.getTime())) return false; // Handle invalid dates

    //     console.log("Converted dueDate is ", dateObj);
    //     const today = new Date();
    //     console.log("today is ", today);
    //     const startOfWeek = new Date(today);
    //     startOfWeek.setDate(today.getDate() + 1 - today.getDay());
    //     console.log("startOfWeek ", startOfWeek);
    //     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    //     console.log("startOfMonth ", startOfMonth);

    //     for (const timeFilter of timeFilters) {
    //         if (timeFilter === 'overdue' && dateObj < today) return true;
    //         if (timeFilter === 'today' && isToday(dateObj)) return true;
    //         if (timeFilter === 'this-week' && isThisWeek(dateObj, startOfWeek)) return true;
    //         if (timeFilter === 'this-month' && isThisMonth(dateObj, startOfMonth)) return true;
    //     }
    //     return false;

    // }

    function isToday(date) {
        console.log("date is ", date);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    function isThisWeek(date, startOfWeek) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
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

    // filterBtn.addEventListener('click', openFilterPanel);
    // closeFilterBtn.addEventListener('click', closeFilterPanel);
});

// *** End of Filter related code/ functions ***

// *** Sorting functionality ***

// I can change the function name.
function sorting() {
    console.log("I am inside sorting function, rockin...");
    const sortContainer = document.querySelector('.sort-container select');
    const sortBy = sortContainer.value;

    // Sort function code
    let sortFunc;
    switch (sortBy) {
        case "newestFirst":
            sortFunc = (taskA, taskB) => {
                const dateA = new Date(taskA.createdAt);
                const dateB = new Date(taskB.createdAt);
                return dateB - dateA;
            };
            break;

        case "oldestFirst":
            sortFunc = (taskA, taskB) => {
                const dateA = new Date(taskA.createdAt);
                const dateB = new Date(taskB.createdAt);
                return dateA - dateB;
            };
            break;

        case "dueDateAsc":
            sortFunc = (taskA, taskB) => {
                const dateA = new Date(taskA.dueDate);
                const dateB = new Date(taskB.dueDate);
                return dateA - dateB;
            };
            break;

        case "dueDateDesc":
            sortFunc = (taskA, taskB) => {
                const dateA = new Date(taskA.dueDate);
                const dateB = new Date(taskB.dueDate);
                return dateB - dateA;
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
                const orderA = priorityOrder[taskA.priority];
                const orderB = priorityOrder[taskB.priority];
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

                const orderA = statusOrder[taskA.status];
                const orderB = statusOrder[taskB.status];
                return orderA - orderB;
            };
            break;

        default:
            sortFunc = (taskA, taskB) => {
                const dateA = new Date(taskA.createdAt);
                const dateB = new Date(taskB.createdAt);
                return dateB - dateA;
            };
        // sortFunc = (a, b) => 0;

    }

    console.log("Current user is ", currentUser);
    // Creating a copy of the taskList(More specifically shallow copy.).
    const temp_taskList = [...currentUser["taskList"]];
    // or we can directly use.
    // const temp_taskList = currentuser["taskList"];
    console.log("Task list inside sorting function without apply sorting is ", currentUser["taskList"]);
    // Updating the temp_taskList.
    temp_taskList.sort(sortFunc);
    // *** no need to apply reversing here as we will display the task list without reversing using reverse() whenever we will display task list. ***

    // temp_taskList.reverse();
    // let user_task_ls = temp_taskList;
    console.log("Default task list is ", currentUser["taskList"]);

    console.log("Sorted tasklist after applying sorting ", temp_taskList);
    console.log("I am inside sorting, about to call displayTasks function.");
    displayTasks(currentUser, temp_taskList);
    console.log("Called display task function.");
}


// Event listener for sorting
const sortDropdown = document.querySelector('.sort-container select');
sortDropdown.addEventListener('change', sorting);
// user_task_ls = currentUser["taskList"];

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
                sorting();
                displayTasks(currentUser, user_task_ls);


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
            showSuccess('Task created successfully');
            // alert("Task created successfully!");
        }
        modal.style.display = "none";
        clearModalForm();
        console.log("Calling the sorting function when adding a new task.");
        sorting();
        displayTasks(currentUser, user_task_ls);
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

                let user_task_ls = currentUser["taskList"];
                displayTasks(currentUser, user_task_ls);


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

// Initialize the application
function initializeApp() {
    populateUserList();
    initViewToggle();
    setupEventListeners();
    setupModalHandlers();
    setupUserModal();
    setupReminderModal();
    notificationCenter();
    initializeDeletion();

    pageManager.showPage('home');
}

initializeApp();
