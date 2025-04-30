// // import { showGlobalOverlay, hideGlobalOverlay } from "./app";
// // import {User} from 'data.js';
// // import {handler}
// export class SelectionManager {

//     constructor() {
//         this.selectedTasks = new Set();
//         this.selectionBar = document.querySelector('.selection-bar');
//         // Maybe here we are just calling the setupSelectionHandlers() method of our class, when creating any object of this.
//         this.setupSelectionHandlers();
//         this.isSelectionMode = false; // This is for showing all checkboxes, when one checkbox is clicking on hovering the task card.
//     }

// setupSelectionHandlers() {

//     // Right now checkbox is showing only when we hovering on the task, but normally it need to add checkbox to everytask. In order to add checkbox to every task, we need to iterate the task-list and need to show the checkbox to every task.

//     const select_all_btn = document.querySelector('.select-all-btn');
//     select_all_btn.addEventListener("click", () => this.handleSelectAll());

//     const cancel_selection_btn = document.querySelector('.cancel-selection-btn');
//     cancel_selection_btn.addEventListener("click", () => this.handleCancelSelection());

//     // It's for bulk delete option, using a single button.
//     const delete_selected_btn = document.querySelector('.delete-selected-btn');
//     delete_selected_btn.addEventListener("click", () => {
//         // Need to implement delete functionality, will do it later on.
//         // We are going to open the modal
//         // showGlobalOverlay();
//         const deleteModal = document.getElementById("delete-modal");
//         deleteModal.style.display = "block";
//         // hideGlobalOverlay();
//         console.log('Delete functionality will be implemented later.')
//     });

//     // const modal_cancel_btn = document.querySelector('modal-cancel-btn');
//     // modal_cancel_btn.addEventListener("click",()=>{
//     //     deleteModal.style.display = "none";
//     // });
// }

//     // New methods

// showAllCheckboxes() {
//     const taskCards = document.querySelectorAll('.task-card');
//     // Showing checkboxes for all tasks.
//     taskCards.forEach(card => {
//         const selectionArea = card.querySelector('.task-selection');
//         selectionArea.style.display = 'flex';
//     });
//     this.selectionMode = true;
// }

// hideAllCheckboxes() {
//     if (this.selectedTasks.size === 0){
//         const taskCards = document.querySelectorAll('.task-card');
//         taskCards.forEach(card => {
//             const selectionArea = card.querySelector('.task-selection');
//             selectionArea.style.display = 'none';
//         });
//         this.selectionMode = false;
//     }
// }


//     handleCheckboxChange(event) {
//         event.stopPropagation(); // Stop event from bubbling up to task card.
//         const taskId = event.target.getAttribute('data-task-id');

//         if (event.target.checked) {
//             this.selectedTasks.add(taskId);
//             this.showAllCheckboxes();
//         }
//         else {
//             this.selectedTasks.delete(taskId);
//             if (this.selectedTasks.size === 0){
//                 this.hideAllCheckboxes();
//             }
//         }
//         // Basically the count of selected tasks.
//         this.updateSelectionBar();
//     }

//     // Handling bulk select.
//     handleSelectAll() {
//         // This checkbox container is associated with each task card, therefore we can just select all check box by selecting the checkboxes, rather than first going to all the task cards, adding checkbox and marking them(checked them.).
//         const checkboxes = document.querySelectorAll('.task-checkbox');
//         checkboxes.forEach(checkbox => {
//             checkbox.checked = true;
//             // Adding all the task
//             this.selectedTasks.add(checkbox.getAttribute('data-task-id'));
//         });
//         this.updateSelectionBar();

//     }

//     // Cancelling bulk selection.
//     handleCancelSelection() {
//         // Here we are not manually hiding the selection bar, we are just deselecting all the tasks, by removing all the task-ids from our selectedTasks set(which is for deleted tasks having task-ids present in set.) and here we are calling updateSelectionBar which will handle this hiding feature by itself.
//         this.selectedTasks.clear();
//         const checkboxes = document.querySelectorAll('.task-checkbox');
//         checkboxes.forEach(checkbox => {
//             checkbox.checked = false;
//         });
//         // this.hideAllCheckboxes();
//         this.updateSelectionBar();
//     }

//     // Showing and hiding the selection bar.
//     updateSelectionBar(){

//         if (this.selectedTasks.size > 0 ){
//             this.selectionBar.style.display = 'flex';
//             this.selectionBar.querySelector('.selected-count').textContent = 
//             `${this.selectedTasks.size} selected`;
//         }
//         else {
//             this.selectionBar.style.display = 'none';
//         }
//     }

//     // Basically handling the change, whether checkbox is marked or not.
//     setupTaskCheckboxes() {
//         const checkboxes = document.querySelectorAll('.task-checkbox');
//         checkboxes.forEach(checkbox => {
//             // Remove existing listeneres to prevent duplicates
//             checkbox.removeEventListener('change',(e) => this.handleCheckboxChange(e));

//             // Add new listener
//             checkbox.addEventListener('change',(e) => this.handleCheckboxChange(e));
//         });
//     }

//     handleDelete(user){

//         // Checking if any tasks are selected.
//         // If any of the checkboxes are selected.
//         if (this.selectedTasks.length !=0) {
//             user.deleteTask(this.selectedTasks);
//         }
//         // Showing confirmation modal for bulk delete is handled above in setupSelectionHandler, and we are handling showing modal for individual delete(basically via delete button icon.)

//         const delete_btn_icon = document.querySelector('.material-icons delete-icon');
//         delete_btn_icon.addEventListener('click',() => {
//             const delete_modal = document.getElementById('delete-modal');
//             delete_modal.style.display = 'block';
//         })
//     }

//     clearSelectionState(){
//         // 1. Clear selectedTasks Set
//         // 2. Uncheck all checkboxes
//         // 3. Hide selection bar
//         // 4. Reset selection mode
//     }
// }

// // function addCheckboxListeners() {
// //     const checkboxes = document.querySelectorAll('.task-checkbox');
// //     checkboxes.forEach(checkbox => {

// //         // Remove any existing listeners first
// //         checkbox.removeEventListener('change',handleCheckBoxChange);

// //         // Add new listener
// //         checkbox.addEventListener('change',handleCheckBoxChange);

// //     });  

// //     // Right now checkbox is showing only when we hovering on the task, but normally it need to add checkbox to everytask. In order to add checkbox to every task, we need to iterate the task-list and need to show the checkbox to every task.
// //     const select_all_btn = document.querySelector('.select-all-btn');
// //     select_all_btn.addEventListener("click",() => {
// //         // Need to add checkboxes to all the tasks simultaneously and need to mark them check 
// //     });

// //     const cancel_selection_btn = document.querySelector('.cancel-selection-btn');
// //     cancel_selection_btn.addEventListener("click", () => {
// //         selectionBar.style.display = 'none';
// //         // Uncheck all the checkboxes.

// //     });

// //     // It's for bulk delete option, using a single button.
// //     const delete_selected_btn = document.querySelector('.delete-selected-btn');
// //     delete_selected_btn.addEventListener("click",()=>{
// //         // Need to implement delete functionality, will do it later on.
// //     });
// // }

// // // *** How we are getting the event here?

// // function handleCheckBoxChange(event) {
// //     const taskId = event.target.getAttribute('data-task-id');
// //     if (event.target.checked) {
// //         selectedTasks.add(taskId);
// //     }
// //     else {
// //         selectedTasks.delete(taskId);
// //     }

// //     // Update selection bar visibility and counter
// //     if (selectedTasks.size > 0) {
// //         selectionBar.style.display = 'flex';
// //         selectionBar.querySelector('.selected-count').textContent =
// //         `${selectedTasks.size} selected`;
// //     }
// //     else {
// //         selectionBar.style.display = 'none';
// //     }
// // }

// Updated code for handling everything

// import { userListKey, userMap , currentUser, displayTask } from "./app.js";


export class DeletionManager {
    constructor() {
        this.selectedTasks = new Set();
        this.taskToDelete;
        this.selectionBar = document.querySelector('.selection-bar');
        this.setupSelectionHandlers();
        this.setupDelete();
        this.isSelectionMode = false;
    }

    // Unable to understand why do we need this here now.
    setupSelectionHandlers() {
        const select_all_btn = document.querySelector('.select-all-btn');
        select_all_btn.addEventListener("click", () => this.handleSelectAll());

        const cancel_selection_btn = document.querySelector('.cancel-selection-btn');
        cancel_selection_btn.addEventListener("click", () => this.handleCancelSelection());
    }


    setupDelete() {
        const deleteModal = document.getElementById("delete-modal");
        const deleteButton = deleteModal.querySelector(".modal-delete-btn");
        const cancelButton = deleteModal.querySelector(".modal-cancel-btn");
        const deleteModalHeader = deleteModal.querySelector(".delete-modal-header");
        const deleteModalBody = deleteModal.querySelector(".delete-modal-body");

        // Creating a helper function 
        // This function is handling dynamic heading and body content of a delete modal.
        const updateModalContent = (taskIds) => {
            const taskIdsArray = Array.from(taskIds);
            let modalHeading = document.getElementById("delete-modal-heading");
            // let modalHeading = deleteModalHeader.querySelector(".delete-modal-heading");
            if (!modalHeading) {
                const h1 = document.createElement('h1');
                // h1.className = 'delete-modal-heading';
                h1.id = "delete-modal-heading";
                deleteModalHeader.appendChild(h1);
                modalHeading = h1;
            }
            // const modalContent = deleteModalBody.querySelectorAll("h2");

            // Delete modal body content
            // let modalBodyContent = deleteModalBody.querySelector(".delete-modal-content");
            let modalBodyContent = document.getElementById("delete-modal-content");
            if (!modalBodyContent){
                const h2 = document.createElement('h2');
                // h2.className = 'delete-modal-content';
                h2.id = "delete-modal-content"
                deleteModalBody.appendChild(h2);
                modalBodyContent = h2;
            }


            if (taskIdsArray.length === 1) {
                // if (heading_str != "") {
                //     modalHeading.textContent = heading_str;
                // }
                // For one task, but here we are deleting from selection bar delete button, not from delete icon.
                modalHeading.textContent = `Delete ${taskIdsArray.length} task?`;
                modalBodyContent.textContent = "Are you sure you want to delete this task?"
                

                // deleteModalBody.textContent = "Are you sure you want to delete this task?";
                // modalContent[0].style.display = 'block';
                // modalContent[1].style.display = 'none';
            }
            else {
                modalHeading.textContent = `Delete ${taskIdsArray.length} tasks?`;
                modalBodyContent.textContent = "Are you sure you want to permanently delete these tasks? This cannot be undone."
                // modalContent[0].style.display = 'none';
                // modalContent[1].style.display = 'block';
            }
        };

        //*** / This function is actually deleting the tasks by calling deleteTask() and also updating the local storage and calling the displayTask(). ***
        // const handleDeleteAction = (taskIds) => {
        //     console.log("currentUser is ",currentUser);
        //     console.log("task_id is",taskIds);
            // const deletionSuccessful = currentUser.deleteTask(taskIds);

            // if (deletionSuccessful) {
            //     this.clearSelectionState();
            //     deleteModal.style.display = "none";
            //     const something = localStorage.getItem("userList");
            //     console.log(something);
            //     console.log(typeof something);
            //     // localStorage.setItem(currentUser.username, JSON.stringify(currentUser.toData()));
            //     // *** This is updating in actual userList, not saving user separately. ***

            //     // ***********************************************************************
            //     // localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values()).map(user => user.toData())));
            //     // displayTask(currentUser);

            //     // ********************************************************************
            // }
            // // else {
            // //     const errorMessage = deleteModal.querySelector('.delete-modal-body h2:nth-child(2)');
            // //     errorMessage.style.display = "block";
            // // }
        // };

        // Bulk delete from selection bar
        // let heading_str = "";
        this.selectionBar.addEventListener('click', (event) => {
            // Basically clicked on the delete button in the selection bar.
            if (event.target.classList.contains('delete-selected-btn')) {
                // It means that atleast on of the checkbox is selected.
                if (this.selectedTasks.size != 0) {
                    // if (this.selectedTasks.size === 1) {
                    //     // heading_str = "Delete 1 Task?";

                    // }
                    updateModalContent(this.selectedTasks);
                    // Selected taskId set for bulk delete.
                    this.taskToDelete = this.selectedTasks;
                    deleteModal.style.display = "block";
                }
            }
        });

        // Individual delete from icon click
        document.querySelector("#task-display").addEventListener("click", (event) => {
            const deleteIcon = event.target.closest('.delete-icon');
            // const deleteIcon = event.target.matches('.delete-icon');

            if (deleteIcon) {
                console.log("deleteIcon is ",deleteIcon);
                console.log("I am here because of delete icon.");
                const taskId = deleteIcon.getAttribute("data-task-id");
                console.log("taskId from delete icon", taskId);
                const taskIdToDelete = new Set([taskId]);
                // Basically we are assigning our one selected task_id to selectedTask set, because eventually it is going to be use for deletion.
                // this.selectedTasks = taskIdToDelete;
                console.log("taskId to delete is ",taskIdToDelete);
                updateModalContent(taskIdToDelete);
                // Setting single taskId set for individual delete.
                this.taskToDelete = taskIdToDelete;
                // const delete_modal_heading = document.querySelector(".delete-modal-heading");
                const delete_modal_heading = document.getElementById("delete-modal-heading");
                delete_modal_heading.textContent = "Delete Task ?";
                deleteModal.style.display = "block";

            }
        });

        // This is for setting correct taskIds to set based on individual tasks or bulk tasks.
        // Fetching task_id for single task.

        deleteButton.addEventListener("click", () => {
            
            // *** I didn't get what this line of code means, or what it is suppose to do?
            // const taskIdsToDelete = this.selectedTasks.size > 0 ? this.selectedTasks : new Set([document.querySelector('.delete-icon[data-task-id]').dataset.task_id]);
            // handleDeleteAction(taskIdsToDelete);
            console.log("Task ids to delete", this.taskToDelete);
            document.dispatchEvent(new CustomEvent("deleteTasks", {detail: {taskIds: this.taskToDelete}}));
            // handleDeleteAction(this.taskToDelete);
            // handleDeleteAction(this.selectedTasks);
        });

        cancelButton.addEventListener("click", () => {
            deleteModal.style.display = "none";

            this.clearSelectionState(); // for safety purpose or I need to add a condition, so that I can call it when deleteModal is getting opened from selectionBar delete button over delete icon.    
        });
    }

    clearSelectionState() {
        // Clearing the set of taskIds(which were marked checked earlier.)
        this.selectedTasks.clear();
        // This checkboxes variable haven't used anywhere yet.
        const checkboxes = document.querySelectorAll(".task-checkbox:checked");
        // For proper cleanup or clearing the selection state, we need to mark all the checked checkboxes to false.
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        this.selectionBar.style.display = 'none';
        this.isSelectionMode = false;
        this.hideAllCheckboxes();
    }

    showAllCheckboxes() {
        // Enable selection mode
        // For showing all unchecked checkboxes, when one checkbox is marked.
        document.body.classList.add("selection-mode");
        const taskCards = document.querySelectorAll('.task-card');

        // Showing checkboxes for all tasks.
        taskCards.forEach(card => {
            card.classList.add("selection-active");  
            console.log("Added .selection-active to:", card);
            // const selectionArea = card.querySelector('.task-selection');
            // selectionArea.style.display = 'flex';
        });
        this.isSelectionMode = true;
    }

    hideAllCheckboxes() {
        if (this.selectedTasks.size === 0) {
            // Disable selection mode.
            document.body.classList.remove("selection-mode");
            console.log("Hiding all checkboxes...");
            const taskCards = document.querySelectorAll('.task-card');
            taskCards.forEach(card => {
                // const selectionArea = card.querySelector('.task-selection');
                // selectionArea.style.display = 'none';
                card.classList.remove("selection-active");
            });
            this.isSelectionMode = false;
        }
    }

    handleCheckboxChange(event) {
        event.stopPropagation(); // Stop event from bubbling up to task card.
        const taskId = event.target.getAttribute('data-task-id');
        console.log("taskId initially is ", taskId);
        console.log("Selected tasks after change:", this.selectedTasks);
        console.log("Selection bar display:", this.selectionBar.style.display);

        if (event.target.checked) {
            this.selectedTasks.add(taskId);
            // Adding selection mode for showing checkboxes when one checkbox is selected
            document.body.classList.add("selection-mode");
            console.log("selectedTasks is ", this.selectedTasks);
            this.showAllCheckboxes();
        }
        else {
            // if (this.selectedTasks.size !==0){
            //     this.selectedTasks.delete(taskId);
            // }
            this.selectedTasks.delete(taskId);
            
            console.log("selectedTasks is ", this.selectedTasks);
            if (this.selectedTasks.size === 0) {
                document.body.classList.remove("selection-mode");
                this.hideAllCheckboxes();
            }
        }
        // Basically the count of selected tasks.
        setTimeout(() => this.updateSelectionBar(),0);
        // this.updateSelectionBar();
    }

    // Handling bulk select.
    handleSelectAll() {
        // This checkbox container is associated with each task card, therefore we can just select all check box by selecting the checkboxes, rather than first going to all the task cards, adding checkbox and marking them(checked them.).
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            // Adding all the task
            this.selectedTasks.add(checkbox.getAttribute('data-task-id'));
        });
        this.updateSelectionBar();

    }

    // Cancelling bulk selection.
    handleCancelSelection() {
        // Here we are not manually hiding the selection bar, we are just deselecting all the tasks, by removing all the task-ids from our selectedTasks set(which is for deleted tasks having task-ids present in set.) and here we are calling updateSelectionBar which will handle this hiding feature by itself.
        this.selectedTasks.clear();
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        // this.hideAllCheckboxes();
        // *** For showing delete-icon on task-cards after clicking on the cancel button from selection bar. ***

        // Remove selection mode from body
        document.body.classList.remove("selection-mode");

        // Remove selection-active class from all cards
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.classList.remove("selection-active");
        });
        this.updateSelectionBar();

        // Ensure delete icons are visible again
        // const deleteIcons = document.querySelectorAll('.delete-icon');
        // deleteIcons.forEach(icon => {
        //     icon.style.display ='';
        // });
    }

    // Showing and hiding the selection bar.
    updateSelectionBar() {
        console.log("Updating selection bar, selected tasks:", this.selectedTasks);

        if (this.selectedTasks.size > 0) {
            console.log("Showing selection bar...");
            this.selectionBar.style.display = 'flex';
            this.selectionBar.querySelector('.selected-count').textContent =
                `${this.selectedTasks.size} selected`;
        }
        else {
            console.log("Hiding selection bar.");
            this.selectionBar.style.display = 'none';
        }
    }

    // Basically handling the change, whether checkbox is marked or not.
    setupTaskCheckboxes() {
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            // Remove existing listeneres to prevent duplicates
            // checkbox.removeEventListener('change', (e) => this.handleCheckboxChange(e));

            // Add new listener
            checkbox.addEventListener('change', (e) => this.handleCheckboxChange(e));

            console.log("Attached event listener to checkbox:", checkbox.getAttribute("data-task-id"));
        });
    }
}