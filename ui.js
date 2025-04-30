// const element = document.getElementById("submitBtn");
// // Adding an event handler
// element.addEventListener("click", CreateUser);

// import { selectedDueDate } from './app.js';
// For user creation.
export function handleFormSubmit(){
    const user_form = document.getElementById("user-data");
    const name = user_form["name"].value.trim();
    const email = user_form["email"].value.trim();
    
    return {name, email};
}

// export function handleTaskData(){
//     const task_form = document.getElementById("task-creation");
//     const task = task_form["task"].value.trim();
//     const description = task_form["description"].value.trim();
//     const status = task_form["status"].value;
//     console.log("status is", status);
//     const priority = task_form["priority"].value;
//     const dueDate = task_form["dueDate"].value;
//     return {task, description, status, priority, dueDate};
// }

// This is for task creation form using modal.

export function handleModalFormData(){

    const form = document.getElementById("task-form");
    return {
        task:form["task"].value.trim(),
        description: form["modal-description"].value.trim(),
        status:form["modal-status"].value,
        priority:form["modal-priority"].value,
        dueDate:form["modal-dueDate"].value
        // dueDate:selectedDueDate
    };
}

// For update form data
export function populateModalForm(taskData){
    if (!taskData) {
        console.error('No task data provided to populateModalForm');
        return;
    }
    const form = document.getElementById("task-form");
    // form["task"].value = taskData.task;
    form["task"].value = taskData.task || '';
    form["modal-description"].value = taskData.description || '';
    form["modal-status"].value = taskData.status || '';
    form["modal-priority"].value = taskData.priority || '';

    // Format date for flatpickr
    // if (taskData.dueDate){
    //     try{
    //         const date = taskData.dueDate instanceof Date ? taskData.dueDate : new Date(taskData.dueDate);

    //         // Format date to match flatpickr's expected format.
    //         const formattedDate = date.toISOString().slice(0,16).replace('T',' ');
    //         console.log("formattedDate is ", formattedDate);;
    //         form["modal-dueDate"]._flatpickr.setDate(formattedDate);

    //     }
    //     catch (error){
    //         console.error("Error setting date: ", error);
    //         form["modal=dueDate"].value = '';
    //     }
    //     // const date = new Date(taskData.dueDate);
    //     // const formattedDate = date.toISOString().slice(0,16).replace('T',' ');
    //     // form["modal-dueDate"].value = formattedDate;
    // }
    // else{
    //     form["modal-dueDate"].value = '';
    // }

    // My first version of code for dueDate
    // form["modal-dueDate"].value = taskData.dueDate || '';

    // Last updated version

    if (taskData.dueDate) {
        try {
            const date = taskData.dueDate instanceof Date ?
                    taskData.dueDate : new Date(taskData.dueDate);

            // Check if the date is valid before using it.

            if (!isNaN(date.getTime())){
                form["modal-dueDate"]._flatpickr.setDate(date);
            }
            else {
                console.error("Invalid date value: ", taskData.dueDate);
                // *** Removing the last flatpickr instance.
                form["modal-dueDate"]._flatpickr.clear();
            }
        }
        catch(error){
            console.error("Error setting date:", error);
            form["modal-dueDate"]._flatpickr.clear();
        }
    }
    else {
        form["modal-dueDate"]._flatpickr.clear();
    }
}

export function clearModalForm(){
    const form = document.getElementById("task-form");
    form.reset();
    // Explictly clearing the flatpickr instance when opening calender for new task.
    form["modal-dueDate"]._flatpickr.clear();

    // Add this for reminder form -> this is also not needed, because we already added some code below..
    // const reminderForm = document.getElementById('reminder-form');
    // if (reminderForm) {
    //     reminderForm.reset();
    //     document.querySelectorAll('.preset-chip').forEach(chip => 
    //         chip.classList.remove('selected'));
    //     if (window.reminderFlatpickr) {
    //         window.reminderFlatpickr.clear();
    //     }
    // }

    // *** Clear any error messages -> Let see firstly that whether below code is sufficient to remove the errors or I need to explicitly add this code. ***
    // const errorDiv = document.getElementById('reminder-error');
    // if (errorDiv) {
    //     errorDiv.style.display = 'none';
    //     errorDiv.textContent = '';
    // }
}

export function showFormErrors(errors, formId){
    // Remove any existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    if (errors.length > 0){
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';

        errors.forEach(error => {
            const errorElement = document.createElement('p');
            errorElement.className = 'error-message';
            errorElement.textContent = error;
            errorContainer.appendChild(errorElement);
        });

        const form = document.getElementById(formId);
        form.insertBefore(errorContainer, form.firstChild);

        // Remove error messages after 3 seconds
        setTimeout(() => {
            errorContainer.remove();
        }, 3000);
    }

    // This reminder code is not needed, because we already added some code below.
    // if (formId === 'reminder-form') {
    //     const errorDiv = document.getElementById('reminder-error');
    //     if (errorDiv) {
    //         errorDiv.textContent = errors[0];
    //         errorDiv.style.display = 'block';
    //     }
    // }
}

export function showSuccess(message){
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;

    document.body.appendChild(successElement);

    // Remove after 3 seconds
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}

export function handleReminderFormData() {
    const selectedChip = document.querySelector('.preset-chip.selected');
    const days = parseInt(document.getElementById('days-input').value) || 0;
    const hours = parseInt(document.getElementById('hours-input').value) || 0;
    const minutes = parseInt(document.getElementById('minutes-input').value) || 0;
    
    if (!selectedChip) {
        return {
            presetValue: null,
            customTime: {
                days: days,
                hours: hours,
                minutes: minutes
            }

        };
    }
    
    return {
        presetValue: selectedChip.dataset.value,
        customTime: null
    };
    // if (selectedChip) {
    //     return {
    //         presetValue: selectedChip.dataset.value,
    //         customTime: null
    //     };
    // }
    
    // return {
    //     presetValue: null,
    //     customTime: {
    //         days: days,
    //         hours: hours,
    //         minutes: minutes
    //     }
    // };
}

export function clearReminderForm() {
    const reminderForm = document.getElementById('reminder-form');
    if (reminderForm) {
        reminderForm.reset();
        document.querySelectorAll('.preset-chip').forEach(chip => 
            chip.classList.remove('selected'));
        
        // Reset custom time inputs
        document.getElementById('days-input').value = '0';
        document.getElementById('hours-input').value = '0';
        document.getElementById('minutes-input').value = '0';
    }
    
    // // Clear any error messages
    // const errorDiv = document.getElementById('reminder-error');
    // if (errorDiv) {
    //     errorDiv.style.display = 'none';
    //     errorDiv.textContent = '';
    // }

    // Clear any error messages using the centralized function
    showFormErrors([], 'reminder-form');
    
    // Update preview text
    const previewElement = document.getElementById('reminder-preview');
    if (previewElement) {
        previewElement.textContent = 'Please select a reminder time';
    }
}

// Helper function to calculate milliseconds for reminder offset
export function calculateReminderOffset(reminderData) {
    if (reminderData.presetValue) {
        switch (reminderData.presetValue) {
            case '15min':
                return 15 * 60 * 1000; // 15 minutes in milliseconds
            case '1hour':
                return 60 * 60 * 1000; // 1 hour in milliseconds
            case '1day':
                return 24 * 60 * 60 * 1000; // 1 day in milliseconds
            default:
                return 0;
        }
    } else if (reminderData.customTime) {
        const { days, hours, minutes } = reminderData.customTime;
        const totalMs = (days * 24 * 60 * 60 * 1000) + 
                        (hours * 60 * 60 * 1000) + 
                        (minutes * 60 * 1000);
        return totalMs;
    }
    
    return 0;
}

// Function to update reminder preview text
export function updateReminderPreview() {
    const selectedChip = document.querySelector('.preset-chip.selected');
    const days = parseInt(document.getElementById('days-input').value) || 0;
    const hours = parseInt(document.getElementById('hours-input').value) || 0;
    const minutes = parseInt(document.getElementById('minutes-input').value) || 0;
    
    const previewElement = document.getElementById('reminder-preview');
    
    if (selectedChip) {
        const chipValue = selectedChip.dataset.value;
        if (chipValue === '15min') {
            previewElement.textContent = 'You will be notified 15 minutes before the due date';
        } else if (chipValue === '1hour') {
            previewElement.textContent = 'You will be notified 1 hour before the due date';
        } else if (chipValue === '1day') {
            previewElement.textContent = 'You will be notified 1 day before the due date';
        }
    } else {
        const hasCustomTime = days > 0 || hours > 0 || minutes > 0;
        
        if (hasCustomTime) {
            let previewText = 'You will be notified ';
            const timeParts = [];
            
            if (days > 0) {
                timeParts.push(`${days} day${days !== 1 ? 's' : ''}`);
            }
            if (hours > 0) {
                timeParts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
            }
            if (minutes > 0) {
                timeParts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
            }
            
            previewText += timeParts.join(', ') + ' before the due date';
            previewElement.textContent = previewText;
        } else {
            previewElement.textContent = 'You will be notified at the exact due time';
        }
    }
}
// // Form validation class
// export class FormValidator {
//     static validateTaskForm(formData){
//         const errors = [];

//         if(!formData.task?.trim()){
//             errors.push("Task name is required");
//         }

//         return errors;
//     }
// }
// Just checkin via calling like this.
// document.getElementById("demo").innerHTML = CreateUser();

// Checking code.....

// const element = document.getElementById("submitBtn");
// // Adding an event handler
// element.addEventListener("click", CreateUser);

// function CreateUser(){
//     const user_form = document.getElementById("user-form");
//     const name = user_form["name"].value;
//     const email = user_form["email"].value;
//     const user = new User(name, email);
//     // document.getElementById("demo").innerHTML = "name is " + name + " " + "email is " + email;
//     // Just printing values to check.
//     console.log("name" + name + " " + "email is "+ email);
//     const user_list = [];
//     // Here I want to store a complete user object but want to display them in the list using username over user object, so how to do this?
//     // user_list.push(user.username); // Just trying
//     user_list.push(user);

//     localStorage("user_list", JSON.stringify(user_list));
// }

// // Just checkin via calling like this.
// document.getElementById("demo").innerHTML = CreateUser();