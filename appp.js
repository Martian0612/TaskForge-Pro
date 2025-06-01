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

        // Add floating buttons
        const buttonsHTML = `
            <button id="jump-to-top-btn" class="jump-button jump-to-top" aria-label="Jump to top of task list">
                <span class="material-icons">arrow_upward</span>
            </button>
            <button id="jump-to-bottom-btn" class="jump-button jump-to-bottom" aria-label="Jump to bottom of task list">
                <span class="material-icons">arrow_downward</span>
            </button>
        `;
        taskDisplay.insertAdjacentHTML('beforeend', buttonsHTML);

        // Initialize floating buttons
        setupFloatingButtonsScrollHandler();

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

            // Debug logging
            console.log("Buttons created:", {
                topButton: document.getElementById('jump-to-top-btn'),
                bottomButton: document.getElementById('jump-to-bottom-btn'),
                container: taskDisplay,
                scrollHeight: taskDisplay.scrollHeight,
                clientHeight: taskDisplay.clientHeight
            });
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

    // Trying this earlier version of code from display tasks when only card view was there because thinking what's the point of checking the view, as we know that interactive elements like tag or reminder-button only exist there.

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


function setupFloatingButtonsScrollHandler() {
    const taskDisplay = document.querySelector("#task-display");
    const jumpToTopBtn = document.getElementById('jump-to-top-btn');
    const jumpToBottomBtn = document.getElementById('jump-to-bottom-btn');

    if (!taskDisplay || !jumpToTopBtn || !jumpToBottomBtn) {
        console.log("Missing elements:", {
            taskDisplay: !!taskDisplay,
            jumpToTopBtn: !!jumpToTopBtn,
            jumpToBottomBtn: !!jumpToBottomBtn
        });
        return;
    }

    console.log("Setting up floating buttons");

    const toggleButtonsVisibility = _.throttle(() => {
        const scrollTop = taskDisplay.scrollTop;
        const scrollHeight = taskDisplay.scrollHeight;
        const clientHeight = taskDisplay.clientHeight;

        // Changed threshold from 500 to 100 for better visibility
        if (scrollTop > 100) {
            jumpToTopBtn.classList.add('visible');
            console.log("Top button should be visible");
        } else {
            jumpToTopBtn.classList.remove('visible');
            console.log("Top button should be hidden");
        }

        // Changed threshold to show bottom button when there's any scrollable content
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceFromBottom > 50 && scrollHeight > clientHeight) {
            jumpToBottomBtn.classList.add('visible');
            console.log("Bottom button should be visible");
        } else {
            jumpToBottomBtn.classList.remove('visible');
            console.log("Bottom button should be hidden");
        }
    }, 100);

    // Add scroll event listener
    taskDisplay.addEventListener('scroll', toggleButtonsVisibility);

    // Add click handlers with smooth scroll
    jumpToTopBtn.addEventListener('click', () => {
        taskDisplay.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    jumpToBottomBtn.addEventListener('click', () => {
        taskDisplay.scrollTo({
            top: taskDisplay.scrollHeight,
            behavior: 'smooth'
        });
    });

    // Force an initial visibility check
    setTimeout(() => {
        toggleButtonsVisibility();
    }, 100);
}

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
