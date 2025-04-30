// import {v4 as uuidv4} from 'uuid';

// export class User{
    
//     // I don't know that why we can't create class properties like this.

//     // An array to store all the task created by the user.
//     taskList = [];
//     constructor(name, email){
//         this.name = name; // Full name or just name
//         this.email = email;

//         this.created_at = new Date()
//         this.username = email.split("@")[0]; // username will be a unique identifier ( and it is useful because if two users have same name but they can't have same email, and we will create username from email.)

//         // An array to store all the task created by the user.
        
//         // localStorage.setItem("username", this);
        
//     }

//     // static fromJSON(json_str){
//     //     const obj = JSON.parse(json_str);
//     //     return new User(obj.name, obj.email);
//         // if typeof obj === "string"{
//         //     obj = JSON.parse(obj);
//         // }

//         // const user = new User(obj.name, obj.email);
//         // user.taskList = obj.taskList || [];
//         // return user;
//     // }
//     addTasks(task){
//         // is it not possible to pass the complete object here.
//         // const user = this.user; // this is the wrong code
//         // const task_obj = new Task(task, user);
        
//         const task_obj = new Task(this.username, task);

//         this.taskList.push(task_obj);

//         // Basically fetching the user list from local storage updating it and storing it back to local storage, similar to what you was thinking.
//         // Update the user data in local storage

//         // I think userList = [] won't be the case becasue we can add tasks only if atleast a user exist.
//         const userList = JSON.parse(localStorage.getItem("userList")) || [];
//         const index = userList.findIndex(user => user.email === this.email);
//         // if we wil get any index with this email, i.e. user exist.

//         if(index !== -1){
//             userList[index] = this; // Update the user in the array
//             localStorage.setItem("userList",JSON.stringify(userList));
//         }
        

//         // this.taskList.push(task_obj);
//     }

//     updateTasks(){
//         // here we need an id of a task to update it.

//     }

//     removeTasks(){
//         // here also we need an id to remove the task.
//     }

//     displayTasks(){
//         for(let i in (this.taskList)){
//             console.log(i + "<br>");
//         }
//     }
// }

// class Task{

//     constructor(username,task){
//         this.username = username;// username is an identifier
//         this.task = task;
//         this.created_at = new Date();
//         this.isCompleted = false;
//         this.id = 4;

//         const user = JSON.parse(localStorage["userList"]).find(user=> user.username === username);
//         // checking
//         console.log("user is ", user);
//         // const taskList = user["taskList"];
        
//         const taskList = user ? user.taskList : [];
//         console.log("taskList is ", taskList);
//         // let random_number = Math.random;
//         // this.task_id = `${this.created_at}${random_number}`;

//         // this.task_id = uuidv4();


//         // localStorage.setItem();
//     }



//     update(task_id, user){
//         // here update thing will happen based on event listener, we will add a checkbox, by default it is unchecked(so false), if user clicked it we will mark it True(completed)

//     }

//     delete(){
//         // here also we need a task id to remove it.
//     }

// }

// import {v4 as uuidv4} from 'uuid';


// export class StorageProxy {

//     constructor(target, storageKey){
//         this.storageKey = storageKey;

//         // Initialize from LocalStorage if exists
//         const storedData = localStorage.getItem(storageKey);

//         if (storedData){
//             Object.assign(target,JSON.parse(storedData));
//         }

//         return new Proxy(target, {
//             set:(obj,prop,value)=>{
//                 obj[prop] = value;
//                 localStorage.setItem(this.storageKey, JSON.stringify(obj));
//                 return true;
//             },
//             get:(obj,prop) =>{
//                 if (typeof obj[prop] === 'function'){
//                     return (...args)=>{
//                         const result = obj[prop].apply(obj,args);
//                         localStorage.setItem(this.storageKey, JSON.stringify(obj));
//                         return result;
//                     };
//                 }
//                 return obj[prop];
//             }
//         });
//     }
// }

// export class User{
//     constructor(name, email){
//         this.name = name;
//         this.email = email;
//         this.created_at = new Date();
//         this.username = email.split("@")[0];
//         // this.taskList = [];
//         this.taskList = new StorageProxy([],`user_${this.email}_tasks`);


//         // Wrap the instance with StorageProxy
//         return new StorageProxy(this, `user_${this.email}`);
//     }

//     addTasks(task){
//         const task_obj = new Task(this.username, task);
//         this.taskList.push(task_obj);
//         return task_obj;
//     }
// }

// export class Task{
//     constructor(username, task){
//         this.username = username;
//         this.task = task;
//         this.created_at = new Date();
//         // this.isCompleted = false;
//         this.task_id = uuidv4();
//     }
// }

// ###########################################
export class User{
    constructor(name, email){
        this.name = name;
        this.email = email;
        this.created_at = new Date();
        this.username = email.split("@")[0];
        this.taskList = [];

        this.customTags = new Set();
    }

    addTasks(task,description,status,priority,dueDate){
        const taskObj = new Task(this.username, task,description, status , priority , dueDate);
        this.taskList.push(taskObj);
        return taskObj;
    }

    // Convert User instance to a plain data object for storage.
    toData(){
        return {
            name: this.name,
            email : this.email,
            created_at : this.created_at.toISOString(),
            username : this.username,
            // Converting the task object into a string in taskList object, so firstly we are iterating those tasks object and converting them into a string and then storing them into a map.
            taskList : this.taskList.map(task => task.toData()),

            customTags: Array.from(this.customTags).map(tag => ({...tag})),
        };
    }

    // Creates a User instance from a plain data object
    static fromData(data){
        const user = new User(data.name, data.email);
        user.created_at = new Date(data.created_at);
        user.taskList = data.taskList.map(taskData => Task.fromData(taskData));

        if (data.customTags){
            user.customTags = new Set(data.customTags.map(tag => ({...tag})));
        }
        return user;
    }

    // Form data is that data, from which we will fetch the updated data, that's why its needed and task_id to update actual task.
    updateTask(taskId,formData){
        const taskIndex = this.taskList.findIndex(task=> task.task_id === taskId);
        // If task with that id exists then call the update method of task.
        if(taskIndex !== -1){
            this.taskList[taskIndex].update(formData);
            return true;
        }
        return false;
    }

    // My code with so many errors...
    // deleteTask(taskIds){
    //     const taskIdsSet = Array.from(taskIds);
    //     const validateCnt = 0;
    //     const delete_modal_body = document.querySelector('.delete-modal-body');
    //     const content = delete_modal_body.querySelectorAll('h2');
    //     const delete_modal_header = document.querySelector('.delete-modal-header');
    //     const element = document.createElement('h1');
    //     element.className = 'delete-modal-heading';
    //     delete_modal_header.appendChild(element);
    //     const deleteBtn = document.querySelector('.modal-delete-btn');
    //     const tempSet = [];

    //     taskIdsSet.forEach(taskId => {
    //         if( uuidv4.validate(taskId)){
    //             validateCnt++;
    //             tempSet.push(taskId);
    //             this.taskList.forEach(task => {
    //                 if(task.task_id != taskId){
    //                     if (validateCnt === 1){
    //                         alert("Task deleted successfully.");
    //                     }
    //                     else  {
    //                         alert("Tasks deleted successfully");
    //                     }
    //                 }
    //             })
    //         }
    //         else{
    //             console.log("Task Id is not valid, please check...");
    //         }
    //     });

    //     deleteBtn.addEventListener('click',()=>{
    //         tempSet.forEach(taskId =>{
    //             this.taskList.filter(task => task.task_id === taskId);
    //         });
            
    //     });


    //     // Deleting one task.
    //     // I know that instead of using validateCnt, I can directly use taskIds set count, but this extra code is because we are adding validation.
    //     if (validateCnt === 1){
    //         element.textContent = 'Delete task?';
    //         content[0].style.display = 'block';
            
    //     }
    //     // Deleting more than 1 task.

    //     else if(validateCnt > 1){ 
    //         // (I think else is fine.)
    //         element.textContent = `Delete ${validateCnt} tasks?`;
    //         content[1].style.display = 'block';
    //     }

    // }

    // *** Refactored deletion code. *** (It is not distributed or modular, here everything related to deletion is trying to do at one place, which is not good.)

    // deleteTask (taskIds) {
    //     const taskIdsSet = Array.from(taskIds);
    //     const validTaskIds = [];
    //     const invalidTaskIds = [];

    //     taskIdsSet.forEach(taskId => {
    //         if (uuid.validate(taskId)) {
    //             console.log(uuid.validate(taskId));
    //         }
    //         else {
    //             invalidTaskIds.push(taskId);
    //             console.log(`Task ID ${taskId} is invalid.`);
    //         }
    //     });

    //     // This invalidTaskIds array or this condition is not valid, as we usually don't have this invalidtaskId case, I don't know that how it can even occur.
    //     if (invalidTaskIds.length > 0){
    //         console.log("Some task IDs are invalid. Please check.");
    //     }

    //     if (validTaskIds.length === 0){
    //         return; 
    //     }

    //     // Confirm deletion with the user (Using the modal)
    //     // We can use similar logic for delete_modal_body as we had use for delete_modal_header, instead of hiding or displaying the h2 elements.

    //     const delete_modal_body = document.querySelector('.delete-modal-body');
    //     const content = delete_modal_body.querySelectorAll('h2');
    //     const delete_modal_header = document.querySelector('.delete-modal-header');
    //     const element = document.createElement('h1');
    //     element.className = 'delete-modal-heading';
    //     delete_modal_header.appendChild(element);
    //     const deleteBtn = document.querySelector('.modal-delete-btn');

    //     if (validTaskIds.length === 1) {
    //         element.textContent = 'Delete task?';
    //         content[0].style.display = 'block';
    //     }
    //     else {
    //         element.textContent = `Delete ${validTaskIds.length} tasks?`;
    //         content[1].style.display = 'block';
    //     }

    //     deleteBtn.addEventListener('click',()=>{

    //         // Delete using filter and reassignment
    //         this.taskList = this.taskList.filter(task => !validTaskIds.includes(task.task_id));
    //     });
    // }

    // Delete Task (Updated code)
    deleteTask(taskIds) {
        console.log("taskId is : ",taskIds);
        const validTaskIds = [];
        function isValidId(uuid) {
            const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
            return regex.test(uuid);
          }

        for (const taskId of taskIds) {
            if (isValidId(taskId)) {
                validTaskIds.push(taskId);
            }
            else {
                console.warn(`Invalid task ID: ${taskId}`);
            }
        }

        if (validTaskIds.length != taskIds.size) {
            console.warn("Some task IDs were invalid.");
        }

        this.taskList = this.taskList.filter(task => !validTaskIds.includes(task.task_id));
        return validTaskIds.length > 0; // This is use for later updating the delete modal body and header content.
    }

}

export class Task{

    // constructor(username, task, status , priority ,description, dueDate){
    constructor(username, task, description="", status = "not started", priority = "", dueDate=null){
    // constructor(username, task, description="", status = "not started", priority = "low", dueDate=null){
        this.username = username;
        this.task = task;
        this.created_at = new Date();
        this.task_id = uuidv4();

        // Optional fields
        this.status = status;
        this.priority = priority;
        this.description = description;
        // I was not creating Date object for due date.
        this.dueDate = dueDate ? new Date(dueDate) : null;

        this.tagsSet = new Set();
    }

    toData(){
        return {
            username: this.username,
            task : this.task,
            created_at : this.created_at.toISOString(),
            task_id : this.task_id,
            // Extra fields
            description: this.description,
            status: this.status,
            priority:this.priority,
            // dueDate:this.dueDate.toISOString()
            dueDate: this.dueDate instanceof Date ? this.dueDate.toISOString() : null,

            tagsSet:Array.from(this.tagsSet).map(tag => ({...tag})),

        };
    }

    static fromData(data){
        const task = new Task(data.username, data.task);
        task.created_at = new Date(data.created_at);
        task.task_id = data.task_id;

        // Extra fields
        task.description = data.description;
        task.status = data.status;
        task.priority = data.priority;
        // Passing a string and expecting the constructor to handle the conversion.
        // task.dueDate = data.dueDate; 

        // *** Fixing date format ***
        task.dueDate = data.dueDate ? new Date(data.dueDate) : null; 

        if (data.tagsSet){
            task.tagsSet = new Set(data.tagsSet.map(tag => ({...tag})));
        }
        return task;
    }

    update(formData){
        this.task = formData.task;
        this.description = formData.description;
        this.status = formData.status;
        this.priority = formData.priority;

        this.dueDate = formData.dueDate ? new Date(formData.dueDate) : null;

        // *** Trying date and time formatting for handling timezone shift. ***

        // if (formData.dueDate){
        //     // Create a date object that preserves the local time.
        //     const parts = formData.dueDate.split(/[-:]/);
        //     // Year, month (0-based), day, hour, minute
        //     this.dueDate = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4]);
        // }
        // else{
        //     this.dueDate = null;
        // }
    }
}