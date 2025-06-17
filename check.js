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

    // Reset all preferences when switching users
    resetForUserSwitch() {
        this.currentView = "card"; // Reset to card view
        this.currentSort = "newestFirst"; // Reset to default sort
        this.activeFilters = { status: [], priority: [], time: [] }; // Clear all filters
        this.searchTerm = ""; // Clear search term

        this.floatingButtons.visible = { top: false, bottom: false };
    },

    // Reset search only (when switching views)
    resetSearch() {
        this.searchTerm = "";
    }
};

async function displayTasks(user, current_task_ls, message = "", viewMode = "card", focusedTaskId = null) {
    console.log("user_task_ls inside displayTasks func. ", current_task_ls);
    console.log("I am inside displayTasks function. View mode: ", viewMode);
    const taskDisplay = document.querySelector("#task-display");

    // Clear existing floating buttons if any
    const existingButtons = taskDisplay.querySelectorAll('.jump-button');
    existingButtons.forEach(button => button.remove());

    // Creating a shallow copy is a good practice, earlier we are directly assigning it to user_task_ls
    let user_task_ls = [...current_task_ls];
    console.log('UserTask list is ', user_task_ls);

    if (message) {
        taskDisplay.innerHTML = `<div class="no-tasks-container"><p class="no-tasks-message">${message}</p></div>`;
        return;
    }

    // Calculate current batch of tasks
    const startIndex = 0;
    const endIndex = appState.pagination.tasksPerPage * appState.pagination.currentPage;
    const tasksToDisplay = user_task_ls.slice(startIndex, endIndex);

    // Check if all tasks are loaded
    appState.pagination.allTasksLoaded = endIndex >= user_task_ls.length;

    // Clear the display area based on the view mode
    if (viewMode === "card") {

        // Card View With Load More Button
        if (appState.pagination.currentPage === 1) {
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


        }

        // For testing purpose
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

                    appState.pagination.currentPage++;
                    refreshTaskDisplay();

                    appState.pagination.isLoading = false;
                    loadMoreBtn.disabled = false;
                    loadingSpinner.classList.remove('visible');
                }
            });
        }
    }

    else {

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

        setupFloatingButtonsScrollHandler("list");

        tasksToDisplay.forEach(task => {
            if (!document.querySelector(`[data-task-id="${task.task_id}"]`)){
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
                    !appState.pagination.allTasksLoaded)
                {
                    appState.pagination.isLoading = true;
                    loadingSpinner.classList.add('visible');

                    // Simulate loading delay 
                    await new Promise(resolve => setTimeout(resolve,300));

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

                appState.currentView = "card";
                
                // Switch to card view and focus on the task
               refreshTaskDisplay(taskId);
              
            }
        }
    }

    // Remove existing and add new event listener
    taskDisplay.removeEventListener("click", handleTaskDisplayClick);
    taskDisplay.addEventListener("click", handleTaskDisplayClick);
}

function refreshTaskDisplay(focusedTaskId = null) {
    if (!currentUser || !currentUser.taskList) {
        console.error("No current user or task list available");
        return;
    }

    // Get sorted and filtered tasks
    const sortedAndFilteredTasks = sorting();

    // Display tasks with the current view mode
    if (sortedAndFilteredTasks.length === 0) {

        // Reset pagination when no results
        appState.pagination.currentPage = 1;
        appState.pagination.allTasksLoaded = true;

        // Determine the appropriate message
        let message = "";
        if (appState.searchTerm) {
            message = "No tasks match your search.";
        } else if (Object.values(appState.activeFilters).some(filters => filters.length > 0)) {
            message = "No tasks match your filters.";
        } else {
            message = "No tasks available.";
        }

        displayTasks(currentUser, [], message, appState.currentView, focusedTaskId);
    } else {
        displayTasks(currentUser, sortedAndFilteredTasks, "", appState.currentView, focusedTaskId);
    }
}
