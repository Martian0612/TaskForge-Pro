// Here we are creating tag chips manually, didn't know that tagify do their own chips creation.

// export function tagHandler(user, predefinedTags, tagModal) {
// export function tagHandler(userListKey,userMap,user, predefinedTags, tagModal) {

//     const input = document.querySelector('input[name="input-custom-dropdown"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');
//     let tagsInstance = input.tagify;

//     function validateTag(tag) {
//         const trimmedTag = tag.trim();
//         const errors = [];

//         if (trimmedTag.length === 0) {
//             errors.push("Tag cannot be empty");
//         }

//         if (trimmedTag.length > 20) {
//             errors.push("Tag must be 20 characters or less");
//         }

//         if (!/^[a-zA-Z0-9.@\-_]+$/.test(trimmedTag)) {
//             errors.push("Only alphanumeric characters, ., @, -, _ allowed.");
//         }

//         return {
//             isValid: errors.length === 0,
//             errors: errors
//         };
//     }

//     function createTagChip(tagData, validationResult = null) {
//         const tagChip = document.createElement('div');
//         tagChip.classList.add('tag-chip');
//         tagChip.dataset.tagId = tagData.id;

//         if (validationResult && !validationResult.isValid) {
//             tagChip.classList.add('invalid-tag');

//             const tooltip = document.createElement('span');
//             tooltip.classList.add('tag-tooltip');

//             const errorList = document.createElement('ol');
//             validationResult.errors.forEach(error => {
//                 const errorItem = document.createElement('li');
//                 errorItem.textContent = error;
//                 errorList.appendChild(errorItem);
//             });

//             tooltip.appendChild(errorList);
//             tagChip.appendChild(tooltip);
//         }

//         // ?????? Don't know what is this two lines of code meant for. 
//         const tagText = tagData.text;
//         const tagText_NoRemove = tagText.slice(0, -1);
//         tagChip.textContent = tagText_NoRemove;

//         const removeButton = document.createElement('span');
//         removeButton.classList.add('remove-tag');
//         removeButton.textContent = 'x';
//         removeButton.addEventListener('click', () => {
//             tagChip.remove();
//             // ??? Doubt.
//             tagsInstance.removeTags(tagText_NoRemove);
//         });

//         tagChip.appendChild(removeButton);
//         return tagChip;
//     }


//     if (!tagsInstance) {
//         const customTags = Array.from(user.customTags).map(tag => tag.text);
//         const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];
//         tagsInstance = new Tagify(input, {
//             whitelist: whitelistTags,
//             maxTags: 5,
//             dropdown: {
//                 classname: "tag-dropdown",
//                 enabled: 1,
//                 maxItems: 5,
//                 enforceWhitelist: false
//             },
//             validate: (tag) => validateTag(tag.value).isValid
//         });

//         tagsInstance.on('add', (e) => {
//             const tagData = e.detail.data;
//             const tagText = tagData.text;
//             const tagId = uuidv4();
//             tagData.id = tagId;

//             const validationResult = validateTag(tagText);

//             // Handling invalid tag code.
//             if (!validationResult.isValid) {
//                 const invalidTagChip = createTagChip(tagData, validationResult);
//                 tagChipsContainer.appendChild(invalidTagChip);

//                 setTimeout(() => {
//                     tagsInstance.removeTags(tagText);
//                     invalidTagChip.remove();
//                 }, 3000);
//             }
//             else {
//                 const tagChip = createTagChip(tagData, validationResult);
//                 tagChipsContainer.appendChild(tagChip);
//             }
//         });
//     }

//     saveTagBtn.addEventListener('click', () => {
//         const taskId = tagModal.dataset.taskid;
//         const task = user.tasklist.find(task => task.task_id === taskId);
//         if (task) {
//             const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');

//             // Temporary array for storing tags
//             // Retriveing the text from tag chips and storing it to temporary tag

//             // Need to retrieve the complete tag data over tag text.

//             //     const tagsArray = Array.from(tagChips).map(chip => chip.textContent);
//             //     tagsArray.forEach(tagText => {
//             //         if (!predefinedTags.some(preTag => preTag.text === tagText)) {
//             //             user.customTags.add({text:tagText});
//             //         }
//             //         task.tagsSet.add({text:tagText});
//             //     });

//             // Adding the complete tag over tag text
//             const tagsArray = Array.from(tagChips).map(chip => chip.tagData);

//             tagsArray.forEach(tagData =>  {
//                 if (!predefinedTags.some(preTag => preTag.tagData === tagData)) {
//                     user.customTags.add({ text: tagData.textContent, id: tagData.id });
//                 }
//                 task.tagsSet.add({ text: tagData.textContent, id: tagData.id });
//             });
//             localStorage.setItem(currentUser.username, JSON.stringify(user.toData()));
//             updateTaskCardTags(task);
//             tagModal.style.display = "none";
//         }
//     });

// function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id=$"task.task_id"]`);
//     const tagsContainer = taskCard.querySelector('.tags-container');

//     // Clearing any existing tags.
//     tagsContainer.innerHTML = '';
//     // Iterating the tagsSet to get tags to display.
//     task.tagsSet.forEach(tag => {
//         const tagElement = document.createElement('span');
//         tagElement.className = 'task-tag';
//         tagElement.textContent = tag.text;
//         tagsContainer.appendChild(tagElement);
//     });

// }
// return tagsInstance;
// }

// ***  Second version of tag implementation. (also include chips creation)***

// export function tagHandler(user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');
//     let tagsInstance = input.tagify;

//     function validateTag(tag) {

//         if (!tag){
//             return {
//                 isValid: false,
//                 errors: ["Tag cannot be empty"]
//             };
//         }

//         const trimmedTag = tag.trim();
//         const errors = [];

//         if (trimmedTag.length === 0) {
//             errors.push("Tag cannot be empty");
//         }

//         if (trimmedTag.length > 20) {
//             errors.push("Tag must be 20 characters or less");
//         }

//         if (!/^[a-zA-Z0-9.@\-_]+$/.test(trimmedTag)) {
//             errors.push("Only alphanumeric characters, ., @, -, _ allowed.");
//         }

//         return {
//             isValid: errors.length === 0,
//             errors: errors
//         };
//     }

//     function createTagChip(tagData, validationResult = null) {
//         const tagChip = document.createElement('div');
//         tagChip.classList.add('tag-chip');
//         tagChip.dataset.tagId = tagData.id;

//         // Store full tag data on the element for later retrieval
//         tagChip.tagData = tagData;

//         if (validationResult && !validationResult.isValid) {
//             tagChip.classList.add('invalid-tag');

//             const tooltip = document.createElement('span');
//             tooltip.classList.add('tag-tooltip');

//             const errorList = document.createElement('ol');
//             validationResult.errors.forEach(error => {
//                 const errorItem = document.createElement('li');
//                 errorItem.textContent = error;
//                 errorList.appendChild(errorItem);
//             });

//             tooltip.appendChild(errorList);
//             tagChip.appendChild(tooltip);
//         }

//         tagChip.textContent = tagData.text;

//         const removeButton = document.createElement('span');
//         removeButton.classList.add('remove-tag');
//         removeButton.textContent = 'x';
//         removeButton.addEventListener('click', () => {
//             tagChip.remove();
//             tagsInstance.removeTags(tagData.text);
//         });

//         tagChip.appendChild(removeButton);
//         return tagChip;
//     }

//     if (!tagsInstance) {
//         const customTags = Array.from(user.customTags).map(tag => tag.text);
//         const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];
//         tagsInstance = new Tagify(input, {
//             whitelist: whitelistTags,
//             maxTags: 5,
//             dropdown: {
//                 classname: "tag-dropdown",
//                 enabled: 1,
//                 maxItems: 5,
//                 enforceWhitelist: false
//             },
//             // validate: (tag) => validateTag(tag.value).isValid
//             validate: (tag) => {
//                 const tagText = typeof tag === 'string' ? tag : (tag.text ||tag.value);
//                 return validateTag(tagText).isValid;
//             }
//         });

//         tagsInstance.on('add', (e) => {
//             const tagData = e.detail.data;
//             const tagText = tagData.text;
//             const tagId = uuidv4();

//             // Extend tag data with ID
//             tagData.id = tagId;

//             const validationResult = validateTag(tagText);

//             if (!validationResult.isValid) {
//                 const invalidTagChip = createTagChip(tagData, validationResult);
//                 tagChipsContainer.appendChild(invalidTagChip);

//                 setTimeout(() => {
//                     tagsInstance.removeTags(tagText);
//                     invalidTagChip.remove();
//                 }, 3000);
//             } else {
//                 const tagChip = createTagChip(tagData);
//                 tagChipsContainer.appendChild(tagChip);
//             }
//         });
//     }

//     saveTagBtn.addEventListener('click', () => {
//         const taskId = tagModal.dataset.taskid;
//         const task = user.taskList.find(task => task.task_id === taskId);
//         if (task) {
//             const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');

//             // Retrieve full tag data
//             const tagsArray = Array.from(tagChips).map(chip => chip.tagData);

//             tagsArray.forEach(tagData => {
//                 // Check if tag already exists in predefined tags
//                 if (!predefinedTags.some(preTag => preTag.text === tagData.text)) {
//                     user.customTags.add({ 
//                         text: tagData.text, 
//                         id: tagData.id 
//                     });
//                 }
//                 task.tagsSet.add({ 
//                     text: tagData.text, 
//                     id: tagData.id 
//                 });
//             });

//             localStorage.setItem(currentUser.username, JSON.stringify(user.toData()));
//             updateTaskCardTags(task);
//             tagModal.style.display = "none";
//         }
//     });

//     function updateTaskCardTags(task) {
//         const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//         const tagsContainer = taskCard.querySelector('.tags-container');

//         tagsContainer.innerHTML = '';
//         task.tagsSet.forEach(tag => {
//             const tagElement = document.createElement('span');
//             tagElement.className = 'task-tag';
//             tagElement.textContent = tag.text;
//             tagsContainer.appendChild(tagElement);
//         });
//     }

//     return tagsInstance;
// }

// ########################################################################################################
// *** 3rd version of tag implementation. (Updated version, no tag chips creation.) ***

// In showTagError function, we are actually creating a container where we can store the error, but tagify already provide their own way of showing errors, so no need of doing it manually.

// function showTagError(errors) {
//     const errorContainer = document.createElement('div');
//     errorContainer.classList.add('tag-error-container');

//     errors.forEach(error => {
//         const errorElement = document.createElement('div');
//         errorElement.textContent = error;
//         errorContainer.appendChild(errorElement);
//     });

//     const tagContainer = document.querySelector('.tag-chips-container');
//     tagContainer.appendChild(errorContainer);

//     // Longer visibility duration
//     setTimeout(() => {
//         errorContainer.remove();
//     }, 5000);
// }

// function validateTag(tag, predefinedTags) {
//     let tagText;

//     if (typeof tag === 'string') {
//         tagText = tag.trim();
//     }

//     else if (tag && typeof tag === 'object'){
//         tagText = (tag.value || tag.text || '').trim();
//     }
//     else {
//         return {
//             isValid:false,
//             errors:["Invalid tag format"]
//         };
//     }

//     console.log("Validating tag text:", tagText);

//     // Check predefined tags
//     if (predefinedTags.some(t => t.text === tagText)){
//         return {
//             isValid:true,
//             errors:[]
//         };
//     }

//     const errors = [];

//     if (tagText.length === 0){
//         errors.push("Tag cannot be empty");
//     }

//     if (tagText.length > 0 && tagText.length < 3){
//         errors.push("Tag must be at least 3 characters");
//     }

//     if (tagText.length > 20){
//         errors.push("Tag must be 20 character or less");
//     }

//     if (/^[0-9]/.test(tagText)) {
//         errors.push("Tag cannot start with a number");
        
//     }

//     if (/^\d+$/.test(tagText)) {
//         errors.push("Tag cannot consist of only numbers");
//     }

//     if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)){
//         errors.push("Only alphanumeric characters, ., @, -, _ allowed.");
//     }

//     return {
//         isValid: errors.length === 0,
//         errors: errors
//     };

// }

// function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     const tagsContainer = taskCard.querySelector('.tags-container');

//     tagsContainer.innerHTML = '';
//     task.tagsSet.forEach(tag => {
//         const tagElement = document.createElement('span');
//         tagElement.className = 'task-tag';
//         tagElement.textContent = tag.text;
//         tagsContainer.appendChild(tagElement);
//     });
// }

// export function tagHandler(userListKey, userMap,user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');

//     // Destroy the tagify input if it is already exist.
//     if (input.tagify) {
//         input.tagify.destroy();
//     }

//     const customTags = Array.from(user.customTags).map(tag => tag.text);
//     const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];

//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         // dropdown: {
//         //     classname: "tagify-custom-dropdown",
//         //     enabled: 1,
//         //     maxItems: 5,
//         //     enforceWhitelist: false
//         // },

//         // *** Here dropdown is not showing as I haven't add mode: 'select', also in earlier versions maybe it is showing dropdown and allowing for custom tags.***
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "text",
//             closeOnSelect: false,
//             highlightFirst: true,
//             placeAbove: false,
//             clearOnSelect: false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             backspace: false,
//             keepInvalidTags: true,
//             // createInvalidTags: true,
//             createInvalidTags: false,
//             placeholder: "Enter tags...",
//             mode: 'mix',
//             enforceWhitelist: true,
//             addTagOn: ["enter"]
//         },


//         validate: (tag) => {
//             // Here I was trying to figure out that whether tag value is stored in text or as value
//             // const tagText = typeof tag === 'string' ? tag : (tag.text || tag.value);

//             // This string testing doesn't eliminating number input as tag.
//             const tagText = typeof tag === 'string' ? tag : (tag.value);
//             console.log("tagText is ", tagText);
//             if (tagText) {
//                 return validateTag(tagText, predefinedTags).isValid;
//             }
//             else {
//                 return false;
//             }
//         },
//         callbacks: {
//             add: (e) => {
//                 // Prevent automatic tag creation in input
//                 // I think I am forcefully stopping automatic tag creation in input because I want it to get validated first and then if it is valid then create a tag, and I want tag creation to be outside of input field, that's why there are classes of adding it outside. But tagify already allow outside tag creation, they provide some css and other code for this purpose.

//                 e.preventDefault();
//                 const tagData = e.detail.data;
//                 console.log("tagData is ", tagData);
//                 const validationResult = validateTag(tagData, predefinedTags);

//                 if (validationResult.isValid) {
//                     console.log("Yes, I am valid", validationResult);

//                     // Create tag chip outside input 
//                     // It can be done using tagify css or some builtin functionality, but didn't know before therefore mgiht be creating it manually.
//                     const tagChip = document.createElement('div');
//                     tagChip.classList.add('tag-chip');

//                     const tagText = document.createElement('span');
//                     tagText.classList.add("tag-text");
//                     tagText.textContent = tagData.text;

//                     // Adding the tagText to the tag chip.

//                     // Since we are adding the tagText within the span, no need to add it with tagChip, but complete data can be add, right now just for flow.
//                     // tagChip.textContent = tagData.text;
//                     // tagChip.dataset.value = tagData.value;

//                     const removeButton = document.createElement('span');
//                     removeButton.classList.add('remove-tag');
//                     removeButton.textContent = 'x';
//                     removeButton.addEventListener('click', () => {
//                         tagChip.remove();
//                         tagsInstance.removeTags(tagData.text);
//                     });

//                     tagChip.appendChild(tagText);
//                     tagChip.appendChild(removeButton);
//                     tagChipsContainer.appendChild(tagChip);

//                     // *** It is suppose to clear input field, after adding, not actually removing the tags.) -> It is removing every tag, we need to add it with save button, not with input element. ***
//                     // tagsInstance.removeAllTags();

//                 }
//                 else if (!validationResult.isValid) {
//                     showTagError(validationResult.errors);
//                 }
//             }
//         },
//         texts: {
//             exceed: "Only 5 tags allowed",
//         }
//     });

//     tagsInstance.DOM.scope.classList.add('custom-tagify');

//     // Clear tags on modal close
//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             input.value = '';
//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };



//     const closeTagModal = document.getElementById('close-tag-modal');
//     closeTagModal.addEventListener('click', handleClose);
//     // closeTagModal.addEventListener("click", () => {
//     //     tagModal.style.display = "none";
//     // });

//     saveTagBtn.addEventListener('click', () => {
//         const taskId = tagModal.dataset.taskid;
//         const task = user.taskList.find(task => task.task_id === taskId);

//         if (task) {
//             // Here actual tag generation will happen or the storage maybe.
//             const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');
//             // Don't know why tagChips is empty.
//             console.log(tagChips);
//             const tagsArray = Array.from(tagChips).map(chip => ({
//                 // need to add a different span for text content in tag chip in order to remove this slice(0,-1), as x(close button need to be seperate from text input, it need to be at right top corner.)
//                 text: chip.textContent,
//                 // text: chip.textContent.slice(0, -1),
//                 value: uuidv4(),
//                 // color: getRandomTagColor()
//             }));

//             tagsArray.forEach(tagData => {
//                 console.log("tagData is ", tagData);

//                 // For avoiding tag duplicate issues.
//                 if (!((Array.from(task.tagsSet)).some(existingTag => existingTag.text === tagData.text))) {
//                     task.tagsSet.add(tagData);

//                     if (!predefinedTags.some(preTag => preTag.text === tagData.text)) {
//                         user.customTags.add(tagData);
//                     }
//                     // task.tagsSet.add(tagData); // was added with above if condition, when outer if don't exist.
//                 }
//             });
//             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
//             // localStorage.getItem(user.username, JSON.stringify(user.toData()));
//             updateTaskCardTags(task);
//             tagModal.style.display = "none";
//             tagsInstance.removeAllTags();
//         }
//     });

//     return tagsInstance;
// }

// ########## Sort of final version ###############

// function validateTag(tag, predefinedTags) {
//     let tagText;

//     if (typeof tag === 'string') {
//         tagText = tag.trim();
//     }
//     else if (tag && typeof tag === 'object'){
//         tagText = (tag.value || tag.text || '').trim();
//     }
//     else {
//         return {
//             isValid: false,
//             errors: ["Invalid tag format"]
//         };
//     }
    
//     // Check predefined tags
//     if (predefinedTags.some(t => t.text === tagText)){
//         return {
//             isValid: true,
//             errors: []
//         };
//     }

//     // Early returns for invalid cases with single error messages
//     if (tagText.length === 0) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot be empty"]
//         };
//     }
    
//     if (/^\d+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot consist of only numbers"]
//         };
//     }

//     if (/^[0-9]/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot start with a number"]
//         };
//     }
    
//     if (tagText.length < 3) {
//         return {
//             isValid: false,
//             errors: ["Tag must be at least 3 characters"]
//         };
//     }

//     if (tagText.length > 20) {
//         return {
//             isValid: false,
//             errors: ["Tag must be 20 characters or less"]
//         };
//     }

//     if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Only alphanumeric characters, ., @, -, _ allowed"]
//         };
//     }

//     return {
//         isValid: true,
//         errors: []
//     };
// }

// export function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     if (!taskCard) return;
    
//     const tagsContainer = taskCard.querySelector('.tags-container');
//     if (!tagsContainer) return;

//     // Clear existing tags
//     tagsContainer.innerHTML = '';
    
//     // Add each tag
//     if (task.tagsSet && task.tagsSet.size > 0) {
//         Array.from(task.tagsSet).forEach(tag => {
//             const tagElement = document.createElement('span');
//             tagElement.className = 'task-tag';
//             tagElement.textContent = tag.text;
//             tagElement.dataset.value = tag.value;

//                        // Add remove button to tag
//                        const removeBtn = document.createElement('span');
//                        removeBtn.className = 'remove-task-tag';
//                        removeBtn.innerHTML = '&times;';
//                        removeBtn.addEventListener('click', function(e) {
//                            e.stopPropagation();
//                            // Remove tag from task's tagsSet
//                            task.tagsSet.delete(tag);
                           
//                            // Update local storage
//                            const userListKey = 'userList'; // You may need to pass this as a parameter
//                            const userMap = new Map(JSON.parse(localStorage.getItem(userListKey) || '[]')
//                                .map(userData => [userData.username, userData]));
                           
//                            localStorage.setItem(userListKey, JSON.stringify(
//                                Array.from(userMap.values())
//                            ));
                           
//                            // Remove tag element from DOM
//                            tagElement.remove();
//                        });
                       
//                        tagElement.appendChild(removeBtn);

//             tagsContainer.appendChild(tagElement);
//         });
//     }
// }

// export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');
    
//     // Clear container first
//     tagChipsContainer.innerHTML = '';

//     // Destroy previous tagify instance to avoid "already tagified" error
//     if (input.tagify) {
//         input.tagify.destroy();
//     }

//     // Get task ID from modal
//     const taskId = tagModal.dataset.taskid;
    
//     // For tags count and handling exceeding logic.
    
//     const task = user.taskList.find(task => task.task_id === taskId);
//     const existingTags = task && task.tagsSet ? Array.from(task.tagsSet) : [];
//     const remainingTagsAllowed = 5- existingTags.length;
//     // Prepare whitelist by combining predefined and custom tags
//     // const customTags = Array.from(user.customTags).map(tag => ({
//     //     value: tag.value || uuidv4(),
//     //     text: tag.text
//     // }));
    
//     // console.log("Predefined tags are: ", predefinedTags);

//     // const whitelist = [
//     //     ...predefinedTags,
//     //     ...customTags
//     // ];

//     // I think this customTags or the predefined Tags were suppose to use only for dropdown, therefore I was only considering tags.

//     // const customTags = Array.from(user.customTags).map(tag => tag.text);
//     // const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];

//     const customTags = Array.from(user.customTags).map(tag => ({
//         value: tag.value,
//         text: tag.text     
//     }));

//     const predefinedTagsFormatted = predefinedTags.map(tag => ({
//         value: tag.value,
//         text: tag.text
//     }));

//     const whitelist = [...predefinedTags, ...customTags];
//     // const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];
    
//     console.log('predefinedTags are' , predefinedTags);
//     console.log("customTags are ", customTags);
//     console.log("whitelistTags are ", whitelist);

//     // Initialize Tagify with built-in features
//     const tagsInstance = new Tagify(input, {
//         // whitelist: whitelistTags,
//         whitelist: whitelist,
//         maxTags: remainingTagsAllowed,
//         enforceWhitelist: true,
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "all",
//             closeOnSelect: false,
//             highlightFirst: true,
//             // clearOnSelect:false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             // backspace:false,
//             // placeholder:"Enter tags...",
//             mode: 'mix',
//             // addTagOn:["enter"]
//         },
//         originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
//         transformTag: function(tagData) {

//             // Generate UUID for new tags

//             if (!tagData.value || tagData.value === tagData.text){
//                 tagData.value = uuidv4();
//             }

//             // Custom validation
//             const validationResult = validateTag(tagData.text, predefinedTags);
//             if (!validationResult.isValid) {
//                 tagData.class = 'tagify--invalid';
//                 tagData.title = validationResult.errors[0]; // Show first error as title
                
//                 // Remove tag after showing error
//                 setTimeout(() => {
//                     this.removeTags(tagData.value);
//                 }, 2000);
//             }
//         },
//         validate: function(tag) {
//             return validateTag(tag.text, predefinedTags).isValid;
//         },
//         texts: {
//             exceed:`Only ${remainingTagsAllowed} more tag${remainingTagsAllowed !== 1 ? 's' : ''} allowed.`,
//         },
//         // inlineTags: true,
//         duplicates: false,
//         addTagOnBlur: false
//     });

//     // Add counter display to show remaining tags
//     const tagCounter = document.createElement('div');
//     tagCounter.className = 'tag-counter';
//     tagCounter.textContent = `${remainingTagsAllowed} tag${remainingTagsAllowed !== 1 ? 's' : ''} remaining`;
//     input.parentNode.insertBefore(tagCounter, input.nextSibling);

//     // Listen for tag addition/removal to update counter
//     function updateTagCounter(){
//         const chipsCount = tagChipsContainer.querySelectorAll('.tag-chip').length;
//         const remaining = Math.max(0, 5-existingTags.length - chipsCount);
//         tagCounter.textContent = `${remaining} tag${remaining !== 1 ? 's' : ''} remaining`;

//         // Disable the input if max tags reached
//         if (remaining === 0) {
//             tagsInstance.setReadonly(true);
//         } else {
//             tagsInstance.setReadonly(false);
//         }
                
//     }
//     // Move tag to external container when added
//     tagsInstance.on('add', function(e) {
//         const tagData = e.detail.data;
//         const validationResult = validateTag(tagData.value, predefinedTags);
        
//         if (validationResult.isValid) {

//             // Check if we've reached the maximum tags limit
//             if (tagChipsContainer.querySelectorAll('.tag-chip').length >= remainingTagsAllowed) {
//                 const errorMsg = `You can only add ${remainingTagsAllowed} more tag${remainingTagsAllowed !== 1 ? 's' : ''}.`;
//                 tagsInstance.DOM.scope.insertAdjacentHTML('afterend', 
//                     `<div class="tagify-error">${errorMsg}</div>`);
                
//                 setTimeout(() => {
//                     const errorEl = tagsInstance.DOM.scope.nextElementSibling;
//                     if (errorEl && errorEl.classList.contains('tagify-error')) {
//                         errorEl.remove();
//                     }
//                 }, 2000);
                
//                 tagsInstance.removeTags(tagData.value);
//                 return;
//             }
            
//             // Ensure tag has UUID value different from text
//             let tagValue = tagData.value;
//             if (!tagValue || tagValue === tagData.text) {
//                 tagValue = uuidv4();
//             }

//             // Create the tag chip in the external container
//             const tagElement = document.createElement('div');
//             tagElement.classList.add('tag-chip');
//             tagElement.dataset.value = tagData.value;
//             tagElement.dataset.text = tagData.text || tagData.value;
            
//             tagElement.innerHTML = `
//                 <span class="tag-text">${tagData.text || tagData.value}</span>
//                 <span class="remove-tag">×</span>
//             `;
            
//             // Add click handler to remove button
//             tagElement.querySelector('.remove-tag').addEventListener('click', function() {
//                 tagElement.remove();
//                 tagsInstance.removeTags(tagData.value);
//                 updateTagCounter();
//             });
            
//             tagChipsContainer.appendChild(tagElement);
            
//             // Remove tag from input after adding to external container
//             tagsInstance.removeTags(tagData.value);
//             updateTagCounter();
//         }
//          else {
//             // Use Tagify's built-in invalid tag class
//             tagsInstance.DOM.scope.classList.add('tagify--invalid');
            
//             // Show validation errors
//             tagsInstance.setReadonly(true);
//             tagsInstance.settings.readonly = true;
            
//             // Create validation message
//             const errorMsg = validationResult.errors.join('. ');
//             tagsInstance.loading(false);
//             tagsInstance.dropdown.hide();
            
//             tagsInstance.DOM.scope.insertAdjacentHTML('afterend', 
//                 `<div class="tagify-error">${errorMsg}</div>`);
            
//             // Remove error after delay
//             setTimeout(() => {
//                 const errorEl = tagsInstance.DOM.scope.nextElementSibling;
//                 if (errorEl && errorEl.classList.contains('tagify-error')) {
//                     errorEl.remove();
//                 }
//                 tagsInstance.setReadonly(false);
//                 tagsInstance.settings.readonly = false;
//                 tagsInstance.removeTags(tagData.value);
//                 tagsInstance.DOM.scope.classList.remove('tagify--invalid');
//             }, 2000);
//         }
//     });
    
//     // Handle modal close
//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             tagsInstance.DOM.input.value = '';
            
//             // Remove any lingering error messages
//             const errorElements = document.querySelectorAll('.tagify-error');
//             errorElements.forEach(el => el.remove());
            
//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };
    
//     const closeTagModal = document.getElementById('close-tag-modal');
//     if (closeTagModal) {
//         // Remove previous event listeners to prevent duplicates
//         closeTagModal.removeEventListener('click', handleClose);
//         closeTagModal.addEventListener('click', handleClose);
//     }
    
//     // Save button click handler
//     if (saveTagBtn) {
//         // Remove previous event listeners to prevent duplicates
//         const oldClickHandler = saveTagBtn.onclick;
//         if (oldClickHandler) {
//             saveTagBtn.removeEventListener('click', oldClickHandler);
//         }
        
//         saveTagBtn.addEventListener('click', () => {
//             const taskId = tagModal.dataset.taskid;
//             const task = user.taskList.find(task => task.task_id === taskId);
            
//             if (task) {
//                 // Get all tag chips from container
//                 const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');
                
//                 // Clear existing tags from the task\
//                 // this was the reason that why my tags are not saving
//                 // task.tagsSet = new Set();
                
//                 // Add tags from chips
//                 Array.from(tagChips).forEach(chip => {
//                     const text = chip.querySelector('.tag-text').textContent;
//                     const value = chip.dataset.value || uuidv4();
                    
//                     const tagData = { text, value };
//                     console.log("checking tags in task ", task.tagsSet);
//                     Array.from(task.tagsSet).forEach(tag => {
//                         console.log(tag);
//                     })
//                     // To avoid duplicate tags
//                     if (!Array.from(task.tagsSet).some(tag => tag.text === tagData.text)){
//                         task.tagsSet.add(tagData);
//                     }
                    
//                     console.log("tagData is ", tagData);
                    
//                     // Add to custom tags if not a predefined tag and also not already exist in custom tags
//                     // if (!predefinedTags.some(preTag => preTag.text === text)) {
//                     //     if(!customTags.some(customTag => customTag.text === text)){
//                     //         user.customTags.add(tagData);
//                     //     }
                        
//                     // }
//                     if (!predefinedTags.some(preTag => preTag.text === text) && 
//                     !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                     user.customTags.add(tagData);
//                 }
//                 //     if (!predefinedTags.some(preTag => preTag.text === text) && 
//                 //     !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                 //     user.customTags.add(tagObj);
//                 // }
//                 });
                
//                 // Save to localStorage
//                 localStorage.setItem(userListKey, JSON.stringify(
//                     Array.from(userMap.values()).map(user => user.toData())
//                 ));
                
//                 // Update task card display
//                 updateTaskCardTags(task);
                
//                 // Close modal
//                 handleClose();
//             }
//         });
//     }
    
//     return tagsInstance;
// }

// #############################################
// invalid tag format version without tag counter
// function validateTag(tag, predefinedTags) {
//     let tagText;

//     if (typeof tag === 'string') {
//         tagText = tag.trim();
//     } else if (tag && typeof tag === 'object') {
//         tagText = (tag.value || tag.text || '').trim();
//     } else {
//         return {
//             isValid: false,
//             errors: ["Invalid tag format"]
//         };
//     }

//     if (predefinedTags.some(t => t.text === tagText)) {
//         return {
//             isValid: true,
//             errors: []
//         };
//     }

//     if (tagText.length === 0) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot be empty"]
//         };
//     }

//     if (/^\d+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot consist of only numbers"]
//         };
//     }

//     if (/^[0-9]/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot start with a number"]
//         };
//     }

//     if (tagText.length < 3) {
//         return {
//             isValid: false,
//             errors: ["Tag must be at least 3 characters"]
//         };
//     }

//     if (tagText.length > 20) {
//         return {
//             isValid: false,
//             errors: ["Tag must be 20 characters or less"]
//         };
//     }

//     if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Only alphanumeric characters, ., @, -, _ allowed"]
//         };
//     }

//     return {
//         isValid: true,
//         errors: []
//     };
// }

// export function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     if (!taskCard) return;

//     const tagsContainer = taskCard.querySelector('.tags-container');
//     if (!tagsContainer) return;

//     tagsContainer.innerHTML = '';

//     if (task.tagsSet && task.tagsSet.size > 0) {
//         Array.from(task.tagsSet).forEach(tag => {
//             const tagElement = document.createElement('span');
//             tagElement.className = 'task-tag';
//             tagElement.textContent = tag.text;
//             tagElement.dataset.value = tag.value;

//             const removeBtn = document.createElement('span');
//             removeBtn.className = 'remove-task-tag';
//             removeBtn.innerHTML = 'x';
//             removeBtn.addEventListener('click', function(e) {
//                 e.stopPropagation();
//                 task.tagsSet.delete(tag);

//                 const userListKey = 'userList';
//                 const userMap = new Map(JSON.parse(localStorage.getItem(userListKey) || '[]')
//                     .map(userData => [userData.username, userData]));

//                 localStorage.setItem(userListKey, JSON.stringify(
//                     Array.from(userMap.values())
//                 ));

//                 tagElement.remove();
//             });

//             tagElement.appendChild(removeBtn);
//             tagsContainer.appendChild(tagElement);
//         });
//     }
// }

// export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');

//     tagChipsContainer.innerHTML = '';

//     if (input.tagify) {
//         input.tagify.destroy();
//     }

//     // const taskId = tagModal.dataset.taskid;
//     // const task = user.taskList.find(task => task.task_id === taskId);
//     // const existingTags = task && task.tagsSet ? Array.from(task.tagsSet) : [];
//     // const maxTags = 5;
//     // const remainingTagsAllowed = maxTags - existingTags.length;

//     // Prepare whitelist for Tagify (dropdown suggestions)
//     const customTags = Array.from(user.customTags).map(tag => ({
//         value: tag.value || uuidv4(), // Ensure custom tags have a UUID
//         text: tag.text
//     }));

//     const predefinedTagsFormatted = predefinedTags.map(tag => ({
//         value: tag.value,
//         text: tag.text
//     }));

//     const whitelist = [...predefinedTagsFormatted, ...customTags];

//     console.log('predefinedTags are', predefinedTags);
//     console.log("customTags are", customTags);
//     console.log("whitelist is", whitelist);

//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelist,
//         maxTags: 5, // Total limit, not just remaining
//         // maxTags: maxTags, // Total limit, not just remaining
//         enforceWhitelist: true,
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1, // Show dropdown after 1 character
//             maxItems: 5,
//             position: "all",
//             closeOnSelect: false,
//             highlightFirst: true,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             mode: 'mix',
//         },
//         originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
//         transformTag: function(tagData) {
//             // Ensure every tag has a unique UUID for its value
//             if (!tagData.value || tagData.value === tagData.text) {
//                 tagData.value = uuidv4();
//             }

//             // Validate the tag
//             const validationResult = validateTag(tagData.text, predefinedTags);
//             if (!validationResult.isValid) {
//                 tagData.class = 'tagify--invalid';
//                 tagData.title = validationResult.errors[0];

//                 setTimeout(() => {
//                     this.removeTags(tagData.value);
//                 }, 2000);
//             }
//         },
//         validate: function(tag) {
//             return validateTag(tag.text, predefinedTags).isValid;
//         },
//         texts: {
//             exceed: `Only 5 tags allowed in total.`,
//             // exceed: `Only ${maxTags} tags allowed in total.`,
//         },
//         duplicates: false,
//         addTagOnBlur: false
//     });

    // // Add counter display for remaining tags
    // // const tagCounter = document.createElement('div');
    // // tagCounter.className = 'tag-counter';
    // // tagCounter.textContent = `${remainingTagsAllowed} tag${remainingTagsAllowed !== 1 ? 's' : ''} remaining`;
    // // input.parentNode.insertBefore(tagCounter, input.nextSibling);

    // // Update the counter and handle max tags logic
    // // function updateTagCounter() {
    // //     const chipsCount = tagChipsContainer.querySelectorAll('.tag-chip').length;
    // //     const totalTags = existingTags.length + chipsCount;
    // //     const remaining = Math.max(0, maxTags - totalTags);
    // //     tagCounter.textContent = `${remaining} tag${remaining !== 1 ? 's' : ''} remaining`;

    // //     if (totalTags >= maxTags) {
    // //         tagCounter.style.color = '#ff4444'; // Highlight in red when max is reached
    // //         tagCounter.textContent = "Maximum tags reached!";
    // //         tagsInstance.setReadonly(true);
    // //     } else {
    // //         tagCounter.style.color = '#666'; // Reset color
    // //         tagsInstance.setReadonly(false);
    // //     }
    // // }

    // // Handle tag addition
    // tagsInstance.on('add', function(e) {
    //     const tagData = e.detail.data;

    //     // Check total tags (existing + new) against max limit
    //     // const totalTags = existingTags.length + tagChipsContainer.querySelectorAll('.tag-chip').length;
    //     // if (totalTags > maxTags) {
    //     //     tagsInstance.removeTags(tagData.value);
    //     //     return;
    //     // }

//         const validationResult = validateTag(tagData.text, predefinedTags);

//         if (validationResult.isValid) {
//             const tagElement = document.createElement('div');
//             tagElement.classList.add('tag-chip');
//             tagElement.dataset.value = tagData.value;
//             tagElement.dataset.text = tagData.text;

//             tagElement.innerHTML = `
//                 <span class="tag-text">${tagData.text}</span>
//                 <span class="remove-tag">×</span>
//             `;

//             tagElement.querySelector('.remove-tag').addEventListener('click', function() {
//                 tagElement.remove();
//                 tagsInstance.removeTags(tagData.value);
//                 updateTagCounter();
//             });

//             tagChipsContainer.appendChild(tagElement);
//             tagsInstance.removeTags(tagData.value);
//             // updateTagCounter();
//         } else {
//             tagsInstance.DOM.scope.classList.add('tagify--invalid');
//             tagsInstance.setReadonly(true);
//             tagsInstance.settings.readonly = true;

//             const errorMsg = validationResult.errors.join('. ');
//             tagsInstance.loading(false);
//             tagsInstance.dropdown.hide();

//             tagsInstance.DOM.scope.insertAdjacentHTML('afterend', 
//                 `<div class="tagify-error">${errorMsg}</div>`);

//             setTimeout(() => {
//                 const errorEl = tagsInstance.DOM.scope.nextElementSibling;
//                 if (errorEl && errorEl.classList.contains('tagify-error')) {
//                     errorEl.remove();
//                 }
//                 tagsInstance.setReadonly(false);
//                 tagsInstance.settings.readonly = false;
//                 tagsInstance.removeTags(tagData.value);
//                 tagsInstance.DOM.scope.classList.remove('tagify--invalid');
//             }, 2000);
//         }
//     });

//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             tagsInstance.DOM.input.value = '';

//             const errorElements = document.querySelectorAll('.tagify-error');
//             errorElements.forEach(el => el.remove());

//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };

//     const closeTagModal = document.getElementById('close-tag-modal');
//     if (closeTagModal) {
//         closeTagModal.removeEventListener('click', handleClose);
//         closeTagModal.addEventListener('click', handleClose);
//     }

//     if (saveTagBtn) {
//         const oldClickHandler = saveTagBtn.onclick;
//         if (oldClickHandler) {
//             saveTagBtn.removeEventListener('click', oldClickHandler);
//         }

//         saveTagBtn.addEventListener('click', () => {
//             const taskId = tagModal.dataset.taskid;
//             const task = user.taskList.find(task => task.task_id === taskId);

//             if (task) {
//                 const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');

//                 Array.from(tagChips).forEach(chip => {
//                     const text = chip.querySelector('.tag-text').textContent;
//                     const value = chip.dataset.value;

//                     const tagData = { text, value };
//                     if (!Array.from(task.tagsSet).some(tag => tag.text === tagData.text)) {
//                         task.tagsSet.add(tagData);
//                     }

//                     if (!predefinedTags.some(preTag => preTag.text === text) &&
//                         !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                         user.customTags.add(tagData);
//                     }
//                 });

//                 localStorage.setItem(userListKey, JSON.stringify(
//                     Array.from(userMap.values()).map(user => user.toData())
//                 ));

//                 updateTaskCardTags(task);
//                 handleClose();
//             }
//         });
//     }

//     return tagsInstance;
// }

// 
/**
 * Validates a tag based on its text content against a set of rules
 * @param {string|Object} tag - The tag to validate (can be string or object with text/value properties)
 * @param {Array} predefinedTags - List of predefined tags to check against
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateTag(tag, predefinedTags) {
    // Extract the text content from the tag (regardless of format)
    let tagText;

    if (typeof tag === 'string') {
        tagText = tag.trim();
    } else if (tag && typeof tag === 'object') {
        // Get the text property regardless of whether it's a direct property or inside a data object
        tagText = (tag.text || (tag.data && tag.data.text) || '').trim();
    } else {
        return {
            isValid: false,
            errors: ["Invalid tag format"]
        };
    }

    // Check if it's a predefined tag (these are always valid)
    if (predefinedTags.some(t => t.text === tagText)) {
        return {
            isValid: true,
            errors: []
        };
    }

    // Run validation rules on the tag text
    if (tagText.length === 0) {
        return {
            isValid: false,
            errors: ["Tag cannot be empty"]
        };
    }

    if (/^\d+$/.test(tagText)) {
        return {
            isValid: false,
            errors: ["Tag cannot consist of only numbers"]
        };
    }

    if (/^[0-9]/.test(tagText)) {
        return {
            isValid: false,
            errors: ["Tag cannot start with a number"]
        };
    }

    if (tagText.length < 3) {
        return {
            isValid: false,
            errors: ["Tag must be at least 3 characters"]
        };
    }

    if (tagText.length > 20) {
        return {
            isValid: false,
            errors: ["Tag must be 20 characters or less"]
        };
    }

    if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)) {
        return {
            isValid: false,
            errors: ["Only alphanumeric characters, ., @, -, _ allowed"]
        };
    }

    return {
        isValid: true,
        errors: []
    };
}

export function updateTaskCardTags(task, userListKey, userMap) {
    const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
    if (!taskCard) return;

    const tagsContainer = taskCard.querySelector('.tags-container');
    if (!tagsContainer) return;

    tagsContainer.innerHTML = '';

    if (task.tagsSet && task.tagsSet.size > 0) {
        Array.from(task.tagsSet).forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'task-tag';
            tagElement.textContent = tag.text;
            tagElement.dataset.value = tag.value;

            // Apply saved colors
            if (tag.bg) tagElement.style.backgroundColor = tag.bg;
            if (tag.textColor) tagElement.style.color = tag.textColor;

            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-task-tag';
            removeBtn.innerHTML = 'x';
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log("task.tagsSet before deletion is ", task.tagsSet);
                task.tagsSet.delete(tag);
                console.log("task.tagsSet after deletion is  is ", task.tagsSet);

                // const userListKey = 'userList';
                // const userMap = new Map(JSON.parse(localStorage.getItem(userListKey) || '[]')
                //     .map(userData => [userData.username, userData]));

                // localStorage.setItem(userListKey, JSON.stringify(
                //     Array.from(userMap.values())
                // ));

                console.log("userListKey is ", userListKey); // its a key(so doesn't matter)
                console.log("userMap is ", userMap);
                localStorage.setItem(userListKey, JSON.stringify(
                    Array.from(userMap.values()).map(user => user.toData())
                ));
                tagElement.remove();
            });

            tagElement.appendChild(removeBtn);
            tagsContainer.appendChild(tagElement);
        });
    }
}

/**
 * Sets up the tag handler for the tag modal
 * @param {string} userListKey - Key for user list in localStorage
 * @param {Map} userMap - Map of users
 * @param {Object} user - Current user
 * @param {Array} predefinedTags - Array of predefined tags
 * @param {HTMLElement} tagModal - The tag modal element
 * @returns {Tagify} The Tagify instance
 */
export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal) {
    const input = document.querySelector('input[name="task-tags"]');
    const tagChipsContainer = document.querySelector('.tag-chips-container');
    const saveTagBtn = document.getElementById('save-tag');
    const maxTags = 5;
    tagChipsContainer.innerHTML = '';

    if (input.tagify) {
        input.tagify.destroy();
    }

    // Prepare whitelist for Tagify (dropdown suggestions)
    const customTags = Array.from(user.customTags).map(tag => ({
        value: tag.value || uuidv4(), // Ensure custom tags have a UUID
        text: tag.text
    }));

    const predefinedTagsFormatted = predefinedTags.map(tag => ({
        value: tag.value,
        text: tag.text
    }));

    const whitelist = [...predefinedTagsFormatted, ...customTags];

    console.log('predefinedTags are', predefinedTags);
    console.log("customTags are", customTags);
    console.log("whitelist is", whitelist);

    const taskId = tagModal.dataset.taskid;
    console.log("taskId is ", taskId);
    console.log("user is ",user);
    const currentTask = user.taskList.find(task => task.task_id === taskId);
    // Replacing it with more refined logic...

    // const tagsSetLen = currentTask.tagsSet.size;
    // if (tagsSetLen >= 5){
    //     console.log("Tags limit exceeded, so can't add more tags.");
    //     return;
    // }

    const existingTagsCount = currentTask ? currentTask.tagsSet.size : 0;

    // Configure Tagify
    const tagsInstance = new Tagify(input, {
        whitelist: whitelist,
        maxTags:5,
        enforceWhitelist: true,
        
        // This is critical - tell Tagify to use text property for display
        tagTextProp: 'text',
        
        templates: {
            dropdownItem: function(tagData){
                return `<div class="tagify__dropdown__item" ${this.getAttributes(tagData)}>${tagData.text}</div>`;
            }
        },

        dropdown: {
            classname: "tag-dropdown",
            enabled: 1, // Show dropdown after 1 character
            placeholder: "Enter tags (max 5)...",
            maxItems: 5,
            position: "all",
            closeOnSelect: false,
            highlightFirst: true,
            fuzzySearch: false,
            searchBy: "text",
            searchKeys: ["text"], // Search only by text, not by value
            mapValueTo:"text",
            sortby: "startsWith",
        },
        
        // Format the original input value to use only the values (UUIDs)
        originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
        
        // Transform tag function is triggered when a tag is added
        transformTag: function(tagData) {
            // Ensure every tag has a unique UUID for its value
            if (!tagData.value || tagData.value === tagData.text) {
                tagData.value = uuidv4();
            }

            // Only validate the tag's text content
            const validationResult = validateTag(tagData.text, predefinedTags);
            if (!validationResult.isValid) {
                tagData.class = 'tagify--invalid';
                tagData.title = validationResult.errors[0];

                // Remove invalid tag after a short delay
                setTimeout(() => {
                    this.removeTags(tagData);
                }, 2000);
            }
        },
        
        // Validate function is called before tag is added
        validate: function(tagData) {
            // Only validate the text content, not the UUID value
            const textToValidate = typeof tagData === 'string' ? tagData : tagData.text;
            return validateTag(textToValidate, predefinedTags).isValid;
        },
        
        texts: {
            exceed: `Only 5 tags allowed in total.`,
        },
        duplicates: false,
        addTagOnBlur: false
    });

    // Default color
    let selectedTagColor = {
        bg: "#f0f4ff",
        text: "#2563eb"
    };
    
    // Setup color selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
    option.addEventListener('click', () => {
    // Remove selected class from all options
    colorOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    option.classList.add('selected');
                // Update selected color
                selectedTagColor.bg = option.dataset.bg;
                selectedTagColor.text = option.dataset.text;
                
                // If we want to update existing tags in the container:
                const currentSelectedTag = tagChipsContainer.querySelector('.tag-chip.selected');
                if (currentSelectedTag) {
                    currentSelectedTag.style.backgroundColor = selectedTagColor.bg;
                    currentSelectedTag.style.color = selectedTagColor.text;
                    currentSelectedTag.dataset.bg = selectedTagColor.bg;
                    currentSelectedTag.dataset.text = selectedTagColor.text;
                }
            });
        });
    // Handle tag addition
    tagsInstance.on('add', function(e) {
        
        // console.log("max tags is ", maxTags);
        const tagData = e.detail.data;
       
        // console.log("max tags is ", maxTags);

        const currentChipsCount = tagChipsContainer.querySelectorAll('.tag-chip').length;
        const totalTags = existingTagsCount + currentChipsCount;

        if (totalTags >=maxTags){
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'tagify-error';
                errorMsg.textContent = 'Maximum of 5 tags allowed';
                
                // Remove existing error messages
                const existingErrors = document.querySelectorAll('.tagify-error');
                existingErrors.forEach(el => el.remove());
                
                // Add new error message below tagify input
                input.parentNode.insertBefore(errorMsg, input.nextSibling);
                
                // Remove the tag
                tagsInstance.removeTags(tagData);
                
                // Remove error after a delay
                setTimeout(() => {
                    errorMsg.remove();
                }, 2000);
                
                return;
        }

  
        // Validate the tag's text content
        const validationResult = validateTag(tagData.text, predefinedTags);

        if (validationResult.isValid) {
            // Create a visual chip for the tag
            const tagElement = document.createElement('div');
            tagElement.classList.add('tag-chip');
            tagElement.dataset.value = tagData.value;
            tagElement.dataset.text = tagData.text;

            // Adding color to tag chip
            tagElement.dataset.bg = selectedTagColor.bg;
            tagElement.dataset.textColor = selectedTagColor.text;
            
            // Apply the selected color
            tagElement.style.backgroundColor = selectedTagColor.bg;
            tagElement.style.color = selectedTagColor.text;

            tagElement.innerHTML = `
                <span class="tag-text">${tagData.text}</span>
                <span class="remove-tag">×</span>
            `;

            // Add remove functionality to the chip
            tagElement.querySelector('.remove-tag').addEventListener('click', function() {
                tagElement.remove();
                tagsInstance.removeTags(tagData.value);
            });

            tagChipsContainer.appendChild(tagElement);
            tagsInstance.removeTags(tagData.value);

            // Allow selecting chip to change its color
            tagElement.addEventListener('click', () => {
                // Remove selected class from all chips
                tagChipsContainer.querySelectorAll('.tag-chip').forEach(chip => 
                    chip.classList.remove('selected'));
                    
                // Add selected class to this chip
                tagElement.classList.add('selected');
            }); 

            // Clear dropdown after adding
            tagsInstance.dropdown.hide();
            tagsInstance.DOM.input.value = '';

        } else {
            // Handle invalid tag
            tagsInstance.DOM.scope.classList.add('tagify--invalid');
            tagsInstance.setReadonly(true);
            
            // Show error message
            const errorMsg = validationResult.errors.join('. ');
            tagsInstance.loading(false);
            tagsInstance.dropdown.hide();

            // Add error message to the DOM
            tagsInstance.DOM.scope.insertAdjacentHTML('afterend', 
                `<div class="tagify-error">${errorMsg}</div>`);

            // Remove error message after a delay
            setTimeout(() => {
                const errorEl = tagsInstance.DOM.scope.nextElementSibling;
                if (errorEl && errorEl.classList.contains('tagify-error')) {
                    errorEl.remove();
                }
                tagsInstance.setReadonly(false);
                tagsInstance.removeTags(tagData);
                tagsInstance.DOM.scope.classList.remove('tagify--invalid');
            }, 2000);
        }

    });

    // Handle modal close
    const handleClose = () => {
        if (tagsInstance) {
            tagsInstance.removeAllTags();
            tagChipsContainer.innerHTML = '';
            tagsInstance.DOM.input.value = '';

            const errorElements = document.querySelectorAll('.tagify-error');
            errorElements.forEach(el => el.remove());

            tagsInstance.destroy();
            input.tagify = null;
        }
        tagModal.style.display = 'none';
    };

    const closeTagModal = document.getElementById('close-tag-modal');
    if (closeTagModal) {
        closeTagModal.removeEventListener('click', handleClose);
        closeTagModal.addEventListener('click', handleClose);
    }

    // Handle save button click
    if (saveTagBtn) {
        const oldClickHandler = saveTagBtn.onclick;
        if (oldClickHandler) {
            saveTagBtn.removeEventListener('click', oldClickHandler);
        }

        saveTagBtn.addEventListener('click', () => {
            const taskId = tagModal.dataset.taskid;
            const task = user.taskList.find(task => task.task_id === taskId);

            if (task) {
                const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');

                const chipCount = tagChips.length;

                if(chipCount > maxTags){
                    alert(`Only ${maxTags} tags allowed.`);
                    return;
                }
                Array.from(tagChips).forEach(chip => {
                    const text = chip.querySelector('.tag-text').textContent;
                    const value = chip.dataset.value;

                    // Adding data for tag color
                    const bg = chip.dataset.bg || "#f0f4ff";
                    const textColor = chip.dataset.textColor || "#2563eb";
                    // const tagData = { text, value };
                    const tagData = { text, value , bg, textColor };
                    
                    // Check if tag already exists in task.tagsSet
                    if (!Array.from(task.tagsSet).some(tag => tag.text === tagData.text)) {
                        task.tagsSet.add(tagData);
                    }

                    // Add to custom tags if not already present
                    if (!predefinedTags.some(preTag => preTag.text === text) &&
                        !Array.from(user.customTags).some(customTag => customTag.text === text)) {
                        user.customTags.add(tagData);
                    }
                });

                // Save to localStorage
                localStorage.setItem(userListKey, JSON.stringify(
                    Array.from(userMap.values()).map(user => user.toData())
                ));

                // Update UI
                updateTaskCardTags(task,userListKey, userMap);
                handleClose();
            }
        });
    }

    return tagsInstance;
}
// ***************************************************************************************************
// Finding the correct version - 1

// function validateTag(tag, predefinedTags) {
//     let tagText;

//     if (typeof tag === 'string') {
//         tagText = tag.trim();
//     }
//     else if (tag && typeof tag === 'object'){
//         tagText = (tag.value || tag.text || '').trim();
//     }
//     else {
//         return {
//             isValid: false,
//             errors: ["Invalid tag format"]
//         };
//     }
    
//     // Check predefined tags
//     if (predefinedTags.some(t => t.text === tagText)){
//         return {
//             isValid: true,
//             errors: []
//         };
//     }

//     // Early returns for invalid cases with single error messages
//     if (tagText.length === 0) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot be empty"]
//         };
//     }
    
//     if (/^\d+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot consist of only numbers"]
//         };
//     }

//     if (/^[0-9]/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot start with a number"]
//         };
//     }
    
//     if (tagText.length < 3) {
//         return {
//             isValid: false,
//             errors: ["Tag must be at least 3 characters"]
//         };
//     }

//     if (tagText.length > 20) {
//         return {
//             isValid: false,
//             errors: ["Tag must be 20 characters or less"]
//         };
//     }

//     if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Only alphanumeric characters, ., @, -, _ allowed"]
//         };
//     }

//     return {
//         isValid: true,
//         errors: []
//     };
// }

// export function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     if (!taskCard) return;
    
//     const tagsContainer = taskCard.querySelector('.tags-container');
//     if (!tagsContainer) return;

//     // Clear existing tags
//     tagsContainer.innerHTML = '';
    
//     // Add each tag
//     if (task.tagsSet && task.tagsSet.size > 0) {
//         Array.from(task.tagsSet).forEach(tag => {
//             const tagElement = document.createElement('span');
//             tagElement.className = 'task-tag';
//             tagElement.textContent = tag.text;
//             tagElement.dataset.value = tag.value;

//             // Remove button

//             const removeButton = document.createElement('span');
//             removeButton.className = 'remove-tag-card';
//             removeButton.innerHTML = 'x';

//             removeButton.addEventListener('click',function(e){
//                 // Prevent task card from opening
//                 e.stopPropagation();

//                 // Remove tag from task.tagsSet
//                 const updatedTagsSet = new Set();
//                 Array.from(task.tagsSet).forEach(existingTag => {
//                     if (existingTag.value !== tag.value){
//                         updatedTagsSet.add(existingTag);
//                     }
//                 });
//                 task.tagsSet = updatedTagsSet;

//                 // Save to localStorage
//                 localStorage.setItem(userListKey, JSON.stringify(
//                     Array.from(userMap.values()).map(user => user.toData())
//                 ));

//                 // Update UI
//                 tagElement.remove();

//             })

//             tagElement.appendChild(removeButton)
//             tagsContainer.appendChild(tagElement);
//         });
//     }
// }

// export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');
    
//     // Clear container first
//     tagChipsContainer.innerHTML = '';

//     // Destroy previous tagify instance to avoid "already tagified" error
//     if (input.tagify) {
//         input.tagify.destroy();
//     }

//     // Get task ID from modal
//     const taskId = tagModal.dataset.taskid;
    
//     // Prepare whitelist by combining predefined and custom tags
//     // const customTags = Array.from(user.customTags).map(tag => ({
//     //     value: tag.value || uuidv4(),
//     //     text: tag.text
//     // }));
    
//     // console.log("Predefined tags are: ", predefinedTags);

//     // const whitelist = [
//     //     ...predefinedTags,
//     //     ...customTags
//     // ];

//     const customTags = Array.from(user.customTags).map(tag => tag.text);
//     const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];
    
//     console.log("customTags are ", customTags);
//     console.log("whitelistTags are ", whitelistTags);

//     // Initialize Tagify with built-in features
//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         enforceWhitelist: true,
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "all",
//             closeOnSelect: false,
//             highlightFirst: true,
//             // clearOnSelect:false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             // backspace:false,
//             // placeholder:"Enter tags...",
//             mode: 'mix',
//             // addTagOn:["enter"]
//         },
//         originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
//         transformTag: function(tagData) {
//             // Custom validation
//             const validationResult = validateTag(tagData.value, predefinedTags);
//             if (!validationResult.isValid) {
//                 tagData.class = 'tagify--invalid';
//                 tagData.title = validationResult.errors[0]; // Show first error as title
                
//                 // Remove tag after showing error
//                 setTimeout(() => {
//                     this.removeTags(tagData.value);
//                 }, 2000);
//             }
//         },
//         validate: function(tag) {
//             return validateTag(tag.value || tag.text, predefinedTags).isValid;
//         },
//         texts: {
//             exceed:"Only 5 tags allowed.",
//         },
//         inlineTags: true,
//         duplicates: false,
//         addTagOnBlur: false
//     });

//     // Move tag to external container when added
//     tagsInstance.on('add', function(e) {
//         const tagData = e.detail.data;
//         const validationResult = validateTag(tagData.value, predefinedTags);
        
//         // Check if we've already reached the maximum number of tags
//         if (tagChipsContainer.querySelectorAll('.tag-chip').length >=5) {
//             // Temporary error message
//             const errorDiv = document.createElement('div');
//             errorDiv.className = 'tagify-error';
//             errorDiv.textContent = 'Only 5 tags allowed per task';

//             // Place to insert the error message
//             const existingError = document.querySelector('.tagify-error');
//             if (existingError){
//                 existingError.remove();
//             }

//             tagsInstance.DOM.scope.insertAdjacenElement('afterend',errorDiv);

//             setTimeout(() => {
//                 if (errorDiv.parentNode){
//                     errorDiv.remove();
//                 }
//             },2000);

//             // Remove the tag that was just added
//             tagsInstance.removeTags(tagData.value);
//             return;
//         }

//         if (validationResult.isValid) {
//             // Create the tag chip in the external container
//             const tagElement = document.createElement('div');
//             tagElement.classList.add('tag-chip');
//             tagElement.dataset.value = tagData.value;
//             tagElement.dataset.text = tagData.text || tagData.value;
            
//             tagElement.innerHTML = `
//                 <span class="tag-text">${tagData.text || tagData.value}</span>
//                 <span class="remove-tag">×</span>
//             `;
            
//             // Add click handler to remove button
//             tagElement.querySelector('.remove-tag').addEventListener('click', function() {
//                 tagElement.remove();
//                 tagsInstance.removeTags(tagData.value);
//             });
            
//             tagChipsContainer.appendChild(tagElement);
            
//             // Remove tag from input after adding to external container
//             tagsInstance.removeTags(tagData.value);
//         } else {
//             // Use Tagify's built-in invalid tag class
//             tagsInstance.DOM.scope.classList.add('tagify--invalid');
            
//             // Show validation errors
//             tagsInstance.setReadonly(true);
//             tagsInstance.settings.readonly = true;
            
//             // Create validation message
//             const errorMsg = validationResult.errors.join('. ');
//             tagsInstance.loading(false);
//             tagsInstance.dropdown.hide();
            
//             tagsInstance.DOM.scope.insertAdjacentHTML('afterend', 
//                 `<div class="tagify-error">${errorMsg}</div>`);
            
//             // Remove error after delay
//             setTimeout(() => {
//                 const errorEl = tagsInstance.DOM.scope.nextElementSibling;
//                 if (errorEl && errorEl.classList.contains('tagify-error')) {
//                     errorEl.remove();
//                 }
//                 tagsInstance.setReadonly(false);
//                 tagsInstance.settings.readonly = false;
//                 tagsInstance.removeTags(tagData.value);
//                 tagsInstance.DOM.scope.classList.remove('tagify--invalid');
//             }, 2000);
//         }
//     });
    
//     // Handle modal close
//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             tagsInstance.DOM.input.value = '';
            
//             // Remove any lingering error messages
//             const errorElements = document.querySelectorAll('.tagify-error');
//             errorElements.forEach(el => el.remove());
            
//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };
    
//     const closeTagModal = document.getElementById('close-tag-modal');
//     if (closeTagModal) {
//         // Remove previous event listeners to prevent duplicates
//         closeTagModal.removeEventListener('click', handleClose);
//         closeTagModal.addEventListener('click', handleClose);
//     }
    
//     // Save button click handler
//     if (saveTagBtn) {
//         // Remove previous event listeners to prevent duplicates
//         const oldClickHandler = saveTagBtn.onclick;
//         if (oldClickHandler) {
//             saveTagBtn.removeEventListener('click', oldClickHandler);
//         }
        
//         saveTagBtn.addEventListener('click', () => {
//             const taskId = tagModal.dataset.taskid;
//             const task = user.taskList.find(task => task.task_id === taskId);
            
//             if (task) {
//                 // Get all tag chips from container
//                 const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');
                
//                 // Clear existing tags from the task\
//                 // this was the reason that why my tags are not saving
//                 // task.tagsSet = new Set();
                
//                 // Add tags from chips
//                 Array.from(tagChips).forEach(chip => {
//                     const text = chip.querySelector('.tag-text').textContent;
//                     const value = chip.dataset.value || uuidv4();
                    
//                     const tagData = { text, value };
//                     console.log("checking tags in task ", task.tagsSet);
//                     Array.from(task.tagsSet).forEach(tag => {
//                         console.log(tag);
//                     })
//                     // To avoid duplicate tags
//                     if (!Array.from(task.tagsSet).some(tag => tag.text === tagData.text)){
//                         task.tagsSet.add(tagData);
//                     }
                    
//                     console.log("tagData is ", tagData);
                    
//                     // Add to custom tags if not a predefined tag and also not already exist in custom tags
//                     // if (!predefinedTags.some(preTag => preTag.text === text)) {
//                     //     if(!customTags.some(customTag => customTag.text === text)){
//                     //         user.customTags.add(tagData);
//                     //     }
                        
//                     // }
//                     if (!predefinedTags.some(preTag => preTag.text === text) && 
//                     !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                     user.customTags.add(tagData);
//                 }
//                 //     if (!predefinedTags.some(preTag => preTag.text === text) && 
//                 //     !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                 //     user.customTags.add(tagObj);
//                 // }
//                 });
                
//                 // Save to localStorage
//                 localStorage.setItem(userListKey, JSON.stringify(
//                     Array.from(userMap.values()).map(user => user.toData())
//                 ));
                
//                 // Update task card display
//                 updateTaskCardTags(task);
                
//                 // Close modal
//                 handleClose();
//             }
//         });
//     }
    
//     return tagsInstance;
// }

// #####################
// *** Code without remove button in external tag. ***
// function validateTag(tag, predefinedTags) {
//     let tagText;

//     if (typeof tag === 'string') {
//         tagText = tag.trim();
//     }
//     else if (tag && typeof tag === 'object'){
//         tagText = (tag.value || tag.text || '').trim();
//     }
//     else {
//         return {
//             isValid: false,
//             errors: ["Invalid tag format"]
//         };
//     }
    
//     // Check predefined tags
//     if (predefinedTags.some(t => t.text === tagText)){
//         return {
//             isValid: true,
//             errors: []
//         };
//     }

//     // Early returns for invalid cases with single error messages
//     if (tagText.length === 0) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot be empty"]
//         };
//     }
    
//     if (/^\d+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot consist of only numbers"]
//         };
//     }

//     if (/^[0-9]/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot start with a number"]
//         };
//     }
    
//     if (tagText.length < 3) {
//         return {
//             isValid: false,
//             errors: ["Tag must be at least 3 characters"]
//         };
//     }

//     if (tagText.length > 20) {
//         return {
//             isValid: false,
//             errors: ["Tag must be 20 characters or less"]
//         };
//     }

//     if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Only alphanumeric characters, ., @, -, _ allowed"]
//         };
//     }

//     return {
//         isValid: true,
//         errors: []
//     };
// }

// export function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     if (!taskCard) return;
    
//     const tagsContainer = taskCard.querySelector('.tags-container');
//     if (!tagsContainer) return;

//     // Clear existing tags
//     tagsContainer.innerHTML = '';
    
//     // Add each tag
//     if (task.tagsSet && task.tagsSet.size > 0) {
//         Array.from(task.tagsSet).forEach(tag => {
//             const tagElement = document.createElement('span');
//             tagElement.className = 'task-tag';
//             tagElement.textContent = tag.text;
//             tagElement.dataset.value = tag.value;
//             tagsContainer.appendChild(tagElement);
//         });
//     }
// }

// export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');
    
//     // Clear container first
//     tagChipsContainer.innerHTML = '';

//     // Destroy previous tagify instance to avoid "already tagified" error
//     if (input.tagify) {
//         input.tagify.destroy();
//     }

//     // Get task ID from modal
//     const taskId = tagModal.dataset.taskid;
    
//     // Prepare whitelist by combining predefined and custom tags
//     // const customTags = Array.from(user.customTags).map(tag => ({
//     //     value: tag.value || uuidv4(),
//     //     text: tag.text
//     // }));
    
//     // console.log("Predefined tags are: ", predefinedTags);

//     // const whitelist = [
//     //     ...predefinedTags,
//     //     ...customTags
//     // ];

//     const customTags = Array.from(user.customTags).map(tag => tag.text);
//     const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];
    
//     console.log("customTags are ", customTags);
//     console.log("whitelistTags are ", whitelistTags);

//     // Initialize Tagify with built-in features
//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         enforceWhitelist: true,
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "all",
//             closeOnSelect: false,
//             highlightFirst: true,
//             // clearOnSelect:false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             // backspace:false,
//             // placeholder:"Enter tags...",
//             mode: 'mix',
//             // addTagOn:["enter"]
//         },
//         originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(','),
//         transformTag: function(tagData) {
//             // Custom validation
//             const validationResult = validateTag(tagData.value, predefinedTags);
//             if (!validationResult.isValid) {
//                 tagData.class = 'tagify--invalid';
//                 tagData.title = validationResult.errors[0]; // Show first error as title
                
//                 // Remove tag after showing error
//                 setTimeout(() => {
//                     this.removeTags(tagData.value);
//                 }, 2000);
//             }
//         },
//         validate: function(tag) {
//             return validateTag(tag.value || tag.text, predefinedTags).isValid;
//         },
//         texts: {
//             exceed:"Only 5 tags allowed.",
//         },
//         inlineTags: true,
//         duplicates: false,
//         addTagOnBlur: false
//     });

//     // Move tag to external container when added
//     tagsInstance.on('add', function(e) {
//         const tagData = e.detail.data;
//         const validationResult = validateTag(tagData.value, predefinedTags);
        
//         if (validationResult.isValid) {
//             // Create the tag chip in the external container
//             const tagElement = document.createElement('div');
//             tagElement.classList.add('tag-chip');
//             tagElement.dataset.value = tagData.value;
//             tagElement.dataset.text = tagData.text || tagData.value;
            
//             tagElement.innerHTML = `
//                 <span class="tag-text">${tagData.text || tagData.value}</span>
//                 <span class="remove-tag">×</span>
//             `;
            
//             // Add click handler to remove button
//             tagElement.querySelector('.remove-tag').addEventListener('click', function() {
//                 tagElement.remove();
//                 tagsInstance.removeTags(tagData.value);
//             });
            
//             tagChipsContainer.appendChild(tagElement);
            
//             // Remove tag from input after adding to external container
//             tagsInstance.removeTags(tagData.value);
//         } else {
//             // Use Tagify's built-in invalid tag class
//             tagsInstance.DOM.scope.classList.add('tagify--invalid');
            
//             // Show validation errors
//             tagsInstance.setReadonly(true);
//             tagsInstance.settings.readonly = true;
            
//             // Create validation message
//             const errorMsg = validationResult.errors.join('. ');
//             tagsInstance.loading(false);
//             tagsInstance.dropdown.hide();
            
//             tagsInstance.DOM.scope.insertAdjacentHTML('afterend', 
//                 `<div class="tagify-error">${errorMsg}</div>`);
            
//             // Remove error after delay
//             setTimeout(() => {
//                 const errorEl = tagsInstance.DOM.scope.nextElementSibling;
//                 if (errorEl && errorEl.classList.contains('tagify-error')) {
//                     errorEl.remove();
//                 }
//                 tagsInstance.setReadonly(false);
//                 tagsInstance.settings.readonly = false;
//                 tagsInstance.removeTags(tagData.value);
//                 tagsInstance.DOM.scope.classList.remove('tagify--invalid');
//             }, 2000);
//         }
//     });
    
//     // Handle modal close
//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             tagsInstance.DOM.input.value = '';
            
//             // Remove any lingering error messages
//             const errorElements = document.querySelectorAll('.tagify-error');
//             errorElements.forEach(el => el.remove());
            
//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };
    
//     const closeTagModal = document.getElementById('close-tag-modal');
//     if (closeTagModal) {
//         // Remove previous event listeners to prevent duplicates
//         closeTagModal.removeEventListener('click', handleClose);
//         closeTagModal.addEventListener('click', handleClose);
//     }
    
//     // Save button click handler
//     if (saveTagBtn) {
//         // Remove previous event listeners to prevent duplicates
//         const oldClickHandler = saveTagBtn.onclick;
//         if (oldClickHandler) {
//             saveTagBtn.removeEventListener('click', oldClickHandler);
//         }
        
//         saveTagBtn.addEventListener('click', () => {
//             const taskId = tagModal.dataset.taskid;
//             const task = user.taskList.find(task => task.task_id === taskId);
            
//             if (task) {
//                 // Get all tag chips from container
//                 const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');
                
//                 // Clear existing tags from the task\
//                 // this was the reason that why my tags are not saving
//                 // task.tagsSet = new Set();
                
//                 // Add tags from chips
//                 Array.from(tagChips).forEach(chip => {
//                     const text = chip.querySelector('.tag-text').textContent;
//                     const value = chip.dataset.value || uuidv4();
                    
//                     const tagData = { text, value };
//                     console.log("checking tags in task ", task.tagsSet);
//                     Array.from(task.tagsSet).forEach(tag => {
//                         console.log(tag);
//                     })
//                     // To avoid duplicate tags
//                     if (!Array.from(task.tagsSet).some(tag => tag.text === tagData.text)){
//                         task.tagsSet.add(tagData);
//                     }
                    
//                     console.log("tagData is ", tagData);
                    
//                     // Add to custom tags if not a predefined tag and also not already exist in custom tags
//                     // if (!predefinedTags.some(preTag => preTag.text === text)) {
//                     //     if(!customTags.some(customTag => customTag.text === text)){
//                     //         user.customTags.add(tagData);
//                     //     }
                        
//                     // }
//                     if (!predefinedTags.some(preTag => preTag.text === text) && 
//                     !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                     user.customTags.add(tagData);
//                 }
//                 //     if (!predefinedTags.some(preTag => preTag.text === text) && 
//                 //     !Array.from(user.customTags).some(customTag => customTag.text === text)) {
//                 //     user.customTags.add(tagObj);
//                 // }
//                 });
                
//                 // Save to localStorage
//                 localStorage.setItem(userListKey, JSON.stringify(
//                     Array.from(userMap.values()).map(user => user.toData())
//                 ));
                
//                 // Update task card display
//                 updateTaskCardTags(task);
                
//                 // Close modal
//                 handleClose();
//             }
//         });
//     }
    
//     return tagsInstance;
// }
// ##################################################################################################
// function showTagError(errors) {
//     const errorContainer = document.createElement('div');
//     errorContainer.classList.add('tag-error-container');

//     errors.forEach(error => {
//         const errorElement = document.createElement('div');
//         errorElement.textContent = error;
//         errorContainer.appendChild(errorElement);
//     });

//     const tagContainer = document.querySelector('.tag-chips-container');
//     tagContainer.appendChild(errorContainer);

//     // Longer visibility duration
//     setTimeout(() => {
//         errorContainer.remove();
//     }, 5000);
// }

// function validateTag(tag, predefinedTags){
//     let tagText;

//     if (typeof tag === 'string'){
//         tagText = tag.trim();
//     }

//     else if (tag && typeof tag === 'object'){
//         tagText = (tag.value || tag.text || '').trim();
//     }

//     else {
//         return {
//             isValid: false,
//             errors: ["Invalid tag format"]
//         };
//     }

//     console.log("Validating tag text: ", tagText);

//     // Check predefined tags
//     if (predefinedTags.some(t => t.text === tagText)){
//         return {
//             isValid:true,
//             errors: []
//         };
//     }

//     const errors = [];

//     // Check for empty tag 
//     if (tagText.length === 0){
//         return {
//             isValid: false,
//             errors: ["Tag cannot be empty"]
//         };
//     }

//     // Check fro numbers-only tag
//     if (/^\d+$/.test(tagText)){
//         return {
//             isValid: false,
//             errors: ["Tag cannot consist of only numbers"]
//         };
//     }

//     // Check if tag starts with number
//     if (/^[0-9]/.test(tagText)) {
//         return {
//             isValid: false,
//             errors: ["Tag cannot start with a number"]
//         };
//     }

//         // Check minimum length
//         if (tagText.length < 3) {
//             errors.push("Tag must be at least 3 characters");
//         }
    
//         // Check maximum length
//         if (tagText.length > 20) {
//             errors.push("Tag must be 20 characters or less");
//         }
    
//         // Check allowed characters
//         if (!/^[a-zA-Z0-9.@\-_]+$/.test(tagText)) {
//             errors.push("Only alphanumeric characters, ., @, -, _ allowed.");
//         }

//         return {
//             isValid: errors.length === 0,
//             errors: errors
//         };
// }

// export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal){
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');

//     // Clear tagChipsContainer
//     tagChipsContainer.innerHTML = '';

//     // Destroy previous tagify instance
//     if (input.tagify){
//         input.tagify.destroy();
//     }

//     const taskId = tagModal.dataset.taskid;

    // const customTags = Array.from(user.customTags).map(tag => tag.text);
    // const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];

//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         templates: {
//             tag: function(tagData){
//                 return `<tag title="${tagData.text}"
//                             contenteditable="false"
//                             spellcheck="false:
//                             class="tagify__tag"
//                             ${this.getAttributes(tagData)}>
//                             <x title="remove tag" class="tagify__tag__removeBtn"></x>
//                             <div>
//                                 <span class="tagify__tag-text">${tagData.text}</span>
//                             </div>
//                         </tag>`;
//             },

//             dropdownItem: function(tagData){
//                 return `<div class="tagify__dropdown__item" ${this.getAttributes(tagData)}>
//                 <span>${tagData.text}</span>
//                 </div>`;
//             }
//         },
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "text",
//             closeOnSelect: false,
//             highlightFirst: true,
//             placeAbove: false,
//             clearOnSelect: false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             backspace: false,
//             keepInvalidTags: true,
//             createInvalidTags: false,
//             placeholder: "Enter tags...",
//             mode: 'mix',
//             enforceWhitelist: true,
//             addTagOn: ["enter"]
//         },
//         validate: (tag) => {
//             const tagText = typeof tag === 'string' ? tag : (tag.value || tag.text);
//             if (tagText) {
//                 return validateTag(tagText, predefinedTags).isValid;
//             }
//             else{
//                 return false;
//             }
//         },
//         callbacks: {
//             add: (e) => {
//                 // Why we are using preventDefault here although we are using tagify builtin tag template over creating chips manually or are we creating chips manually somewhere?
//                 e.preventDefault();
//                 const tagData = e.detail.data;
//                 console.log("tagData is ", tagData);
//                 const validationResult = validateTag(tagData, predefinedTags)

//                 if (validationResult.isValid){
//                     console.log("Tag is valid: ", validationResult);

//                     // Check if tag already exists in container
//                     const existingTags = Array.from(tagChipsContainer.querySelectorAll('.tag-chip .tag-text')).map(el => el.textContent);
//                     if (existingTags.includes(tagData.text)){
//                         showTagError(["Tag already exists"]);
//                         return;
//                     }

//                     // Create tag chip outside input using customized template
//                     // ??? But even with customized templates we are sort of creating the tag chips, which I was doing earlier.
//                     const tagChip = document.createElement('div');
//                     tagChip.classList.add('tag-chip');
//                     tagChip.dataset.text = tagData.text;

//                     const tagText = document.createElement('span');
//                     tagText.classList.add("tag-text");
//                     tagText.textContent = tagData.text;

//                     const removeButton = document.createElement('span');
//                     removeButton.classList.add('remove-tag');
//                     removeButton.textContent = 'x';
//                     removeButton.addEventListener('click', () => {
//                         tagChip.remove();
//                     });

//                     tagChip.appendChild(tagText);
//                     tagChip.appendChild(removeButton);
//                     tagChipsContainer.appendChild(tagChip);

//                 }
//                 else if (!validationResult.isValid) {
//                     showTagError(validationResult.errors);
//                 }
//             }
//         },
//         texts: {
//             exceed: "Only 5 tags allowed",
//         }
//     });

//     tagsInstance.DOM.scope.classList.add('custom-tagify');

//     // Handle modal close
//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             input.value = '';
//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };

//     const closeTagModal = document.getElementById('close-tag-modal');
//     closeTagModal.addEventListener('click',handleClose);

//     // Save button logic
//     saveTagBtn.addEventListener('click',() =>{
//         const taskId = tagModal.dataset.taskid;
//         const task = user.taskList.find(task => task.task_id === taskId);

//         if (task){
//             const tagChips = tagChipsContainer.querySelectorAll('.tag-chip');
//             console.log("Tag chips found: ", tagChips.length);

//             Array.from(tagChips).forEach(chip => {
//                 const text = chip.querySelector('.tag-text').textContent.trim();

//                 // Only add if tag doesn't already exist in task's tagsSet
//                 if (!Array.from(task.tagsSet).some(existingTag => existingTag.text === text)){
//                     const tagData = {
//                         text: text,
//                         value: uuidv4()
//                     };
    
//                     task.tagsSet.add(tagData);
    
//                     // Add to custom tags if not a predefined tag
//                     if (!predefinedTags.some(preTag => preTag.text === text)){
//                         user.customTags.add(tagData);
//                     }
//                 }
//             });

//             // Save to localStorage
//             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));

//             // Update Ui or Task cards
//             updateTaskCardTags(task);

//             // Close modal and clean up (We are using handleClose function in saveBtn logic because we have to implement same logic here(of cleanup))
//             handleClose();
//         }
//     });

//     return tagsInstance;
// }

// export function updateTaskCardTags(task){
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);

//     // When will this case occur, and why do we need handle it, if it will occur then we won't be able to add tags.
//     if (!taskCard) return;

//     const tagsContainer = taskCard.querySelector('.tags-container');
//     if (!tagsContainer) return;

//     // Clear existing tags
//     tagsContainer.innerHTML = '';

//     // Add each tag from the task's tagsSet to the actual task card for display
//     if (task.tagsSet && task.tagsSet.size > 0){
//         Array.from(task.tagsSet).forEach(tag => {
//             const tagElement = document.createElement('span');
//             tagElement.className = 'task-tag';
//             tagElement.textContent = tag.text;
//             tagsContainer.appendChild(tagElement);
//         });
//     }

// }

// #######################################################################


// ################# Updated 3rd version
// function validateTag(tag, predefinedTags) {
//     // Trim the tag to ensure clean input
//     const trimmedTag = (typeof tag === 'string' ? tag : tag.value).trim();

//     // Skip validation for predefined tags
//     if (predefinedTags.some(t => t.text === trimmedTag)) {
//         return true;
//     }

//     // Validation rules
//     if (trimmedTag.length === 0) {
//         return "Tag cannot be empty";
//     }
//     if (trimmedTag.length > 20) {
//         return "Tag must be 20 characters or less";
//     }
//     if (!/^[a-zA-Z0-9.@\-_]+$/.test(trimmedTag)) {
//         return "Only alphanumeric characters, ., @, -, _ allowed";
//     }
//     if (/^\d+$/.test(trimmedTag)) {
//         return "Tags cannot be purely numeric";
//     }

//     return true;
// }

// function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     const tagsContainer = taskCard.querySelector('.tags-container');
//     tagsContainer.innerHTML = '';
//     task.tagsSet.forEach(tag => {
//         const tagElement = document.createElement('span');
//         tagElement.className = 'task-tag';
//         tagElement.textContent = tag.text;
//         tagsContainer.appendChild(tagElement);
//     });
// }

// export function tagHandler(userListKey, userMap, user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagChipsContainer = document.querySelector('.tag-chips-container');
//     const saveTagBtn = document.getElementById('save-tag');
//     const closeBtn = tagModal.querySelector('.close-modal'); // Assumes a close button with this class

//     // Robust cleanup to avoid reinitialization warning
//     if (input.tagify) {
//         input.tagify.destroy();
//         input.tagify = null; // Nullify reference
//         input.value = ''; // Clear input
//         tagChipsContainer.innerHTML = ''; // Clear container
//     }

//     const customTags = Array.from(user.customTags).map(tag => tag.text);
//     const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];

//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         mode: 'mix', // Allow both dropdown and custom tags
//         enforceWhitelist: false, // Allow custom tags not in whitelist
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "text",
//             closeOnSelect: false,
//             highlightFirst: true,
//             placeAbove: false,
//             clearOnSelect: false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             backspace: false,
//             placeholder: "Enter tags...",
//             addTagOn: ["enter"]
//         },
//         validate: (tag) => {
//             const tagText = typeof tag === 'string' ? tag : tag.value;
//             return validateTag(tagText, predefinedTags);
//         },
//         callbacks: {
//             add: () => {
//                 // No e.preventDefault(); let Tagify add tags to tagify.value
//                 // Move tags to tagChipsContainer manually for now
//                 const tags = tagsInstance.DOM.scope.querySelectorAll('.tagify__tag');
//                 tagChipsContainer.innerHTML = '';
//                 tags.forEach(tag => {
//                     tagChipsContainer.appendChild(tag.cloneNode(true));
//                 });
//             },
//             invalid: (e) => {
//                 // Tagify handles error display via tooltip
//                 setTimeout(() => {
//                     tagsInstance.DOM.input.classList.remove('tagify--invalid');
//                 }, 3000);
//             }
//         },
//         classNames: {
//             scope: 'tagify--outside' // Move tags outside the input
//         },
//         texts: {
//             exceed: "Only 5 tags allowed"
//         }
//     });

//     // Ensure Tagify input retains styling
//     tagsInstance.DOM.input.classList.add('tagify__input');

//     // Clear tags on modal close
//     const handleClose = () => {
//         if (tagsInstance) {
//             tagsInstance.removeAllTags();
//             tagChipsContainer.innerHTML = '';
//             input.value = '';
//             tagsInstance.destroy();
//             input.tagify = null;
//         }
//         tagModal.style.display = 'none';
//     };

//     closeBtn.addEventListener('click', handleClose);
//     saveTagBtn.addEventListener('click', () => {
//         const taskId = tagModal.dataset.taskid;
//         const task = user.taskList.find(task => task.task_id === taskId);
//         if (task) {
//             const tagsArray = tagsInstance.value.map(tagData => ({
//                 text: tagData.value, // Use value as display text for now
//                 value: uuidv4() // Unique ID
//             }));
//             tagsArray.forEach(tagData => {
//                 if (!(Array.from(task.tagsSet).some(existingTag => existingTag.text === tagData.text))) {
//                     task.tagsSet.add(tagData);
//                     if (!predefinedTags.some(preTag => preTag.text === tagData.text)) {
//                         user.customTags.add(tagData);
//                     }
//                 }
//             });
//             localStorage.setItem(userListKey, JSON.stringify(Array.from(userMap.values().map(user => user.toData()))));
//             updateTaskCardTags(task);
//             handleClose(); // Reuse cleanup logic
//         }
//     });

//     return tagsInstance;
// }

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// 4th version of tag implementation.

// export function tagHandler(user, predefinedTags, tagModal) {
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagContainer = document.querySelector('#tagify-container');
//     const saveTagBtn = document.getElementById('save-tag');

//     if (input.tagify) {
//         input.tagify.destroy();
//     }

//     // Clear any lingering tags from previous tasks
//     input.value = '';
//     tagContainer.innerHTML = '';

//     // const customTags = Array.from(user.customTags).map(tag => tag.text);
//     const customTags = Array.from(user.customTags).map(tag => tag.text);

//     const whitelistTags = [...predefinedTags.map(t => t.text), ...customTags];

//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         mode: 'select',
//         skipInvalid: true,
//         classNames:{
//             input: 'tagify__input__outside', // Add
//             scope:'tagify--outside'
//         },
//         dropdown: {
//             classname: "tag-dropdown",
//             enabled: 1,
//             maxItems: 5,
//             position: "text",
//             closeOnSelect: false,
//             highlightFirst: true,
//             placeAbove: false,
//             clearOnSelect: false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             backspace: false,
//             keepInvalidTags: true,
//             createInvalidTags: false, // Help to not actually create invalid tags.,
//             mode: 'mix',
//             placeholder: "Enter tags...",
//             enforceWhitelist: true,
//             addTagOn: ["enter"]
//         },


//         validation: {
//             validate: (tag) => {
//                 const tagText = typeof tag === 'string' ? tag : (tag.text || tag.value);
//                 if (!tagText) return "Tag cannot be empty" ;
//                 // if (!tagText) return "Tag cannot be empty" || false;

//                 // if (!tagText) return false;

//                 const trimmedTag = tagText.trim();

//                 if (trimmedTag.length < 3) {
//                     return "Tag must be at least 3 characters long.";
//                 }

//                 if (trimmedTag.length > 20) {
//                     return "Tag must be 20 characters or less";
//                 }

//                 if (!/^[a-zA-Z0-9.@\-_]+$/.test(trimmedTag)) {
//                     return "Only alphanumeric characters, ., @, -, _ allowed.";
//                 }

//                 return true;
//                 // This case is redudant, because we are okay, if tag is not in the whitelist, we will add it as a custom tag.
//                 // if(whitelistTags.includes(trimmedTag)) {return true;}
//             }
//         },

//         callbacks: {
//             // add: (e) => {

//             //     // Only prevent default if the tag is invalid
//             //     const tagData = e.detail.data;
//             //     if (e.detail.data.invalid) {
//             //         e.preventDefault();
//             //     }
//             //     else{
//             //         // For safety, again Ensuring proper tag structure when adding.
//             //         const tagData = e.detail.data;
//             //         tagData.value = uuidv4();
//             //         tagData.text =  tagData.value;
//             //         console.log('Added tag:', tagData);
//             //     }
//             //     updateTagContainer();
//             //     // e.preventDefault();
//             // },

//             add: (e) =>{
//                 const tagData = e.detail.data;
//                 if (!tagData.isValid) {
//                     // e.preventDefault();
//                     return;
//                 }

//                 // Add tagId if it doesn't exist. (This code  part is redundant because why it will be the case that tagId won't exist, we are creating it while creating tags.)
//                 if (!tagData.tagId) {
//                     tagData.tagId = uuidv4();
//                 }
//                 updateTagContainer();
//             },
//             // Showcasing the error
//             invalid: ({ errors }) => {
//                 if (errors && errors.length > 0) {
//                     tagsInstance.settings.errorMessage = errors[0];
//                     tagsInstance.DOM.input.classList.add('tagify--invalid');
//                     setTimeout(() => {
//                         tagsInstance.settings.errorMessage = '';
//                         tagsInstance.DOM.input.classList.remove('tagify--invalid');
//                     }, 3000);
//                 }
//             }
//         },
//         texts: { exceed: 'Only 5 tags allowed' }
//     });

//     // Update tag container on add/remove events
//     // tagsInstance.on('add', updateTagContainer);
//     // tagsInstance.on('remove', updateTagContainer);

//     // Using tagify inbuilt mechanism to create tag chips over doing it manually.
//     function updateTagContainer() {
//         if (!tagContainer) return; // for safety
//         tagContainer.innerHTML = '';

//         // What does this line of code means?

//         tagsInstance.value.forEach(tagData => {
//             const tagElm = document.createElement('span');
//             tagElm.className = 'tagify__tag';

//         tagElm.innerHTML = `
//                 <span class='tagify__tag-text'>${tagData.value}</span>
//                 <span class='tagify__tag__removeBtn' role='button' aria-label='remove tag'>&times;</span>
//             `;


//         tagContainer.appendChild(tagElm);

//         const removeButton = tagElm.querySelector('.tagify__tag__removeBtn');
//         if (removeButton) {
//             removeButton.addEventListener('click',()=>{
//                 tagsInstance.removeTags(tagData.value);
//                 updateTagContainer();
//             });
//         }
//     });
//         // // For testing...
//         // const tags = tagsInstance.value;
//         // console.log('Current tags:', tags);

//         // tags.forEach(tagData => {
//         //     // Ensure proper tag structure
//         //     const text = tagData.value;
//         //     const value = uuidv4();

//         //     const tagElm = document.createElement('span');
//         //     tagElm.className = 'tagify__tag';
//         //     // Newly added
//         //     tagElm.dataset.value = value;


//         //     // Display the TEXT, but store the VALUE (UUID)
//         //     // tagElm.innerHTML = `
//         //     // <x title='remove tag' class='tagify__tag__removeBtn></x>
//         //     // <div>
//         //     // <span class='tagify__tag-text'>${tagData.text}</span></div>
//         //     // `

//         //     tagElm.innerHTML = `
//         //     <span class='tagify__tag-text'>${tagData.value}</span>
//         //     <span class='tagify__tag__removeBtn' role='button' aria-label='remove tag'>&times;</span>
//         // `;
//         //     console.log("tag data is", tagData);
//         //     console.log("tag text is", tagData.text);

//         //     tagContainer.appendChild(tagElm);

//         //     const removeButton = tagElm.querySelector('.tagify__tag__removeBtn');
//         //     removeButton.addEventListener('click', () => {
//         //         tagsInstance.removeTags(tagData.value);
//         //         updateTagContainer();
//         //     });
//         // });
//     }

//     saveTagBtn.addEventListener('click', () => {
//         const taskId = tagModal.dataset.taskid;
//         const task = user.taskList.find(task => task.task_id === taskId);

//         // Storing the tags to the temporary array, and then saving it to tag.

//         if (task) {
//             // const tagsArray = tagsInstance.value.map(tagData => ({
//             //     text: tagData.text,
//             //     // value: tagData.value,
//             //     value: tagData.value || uuidv4(),
//             //     // color: getRandomTagColor()
//             // }));

//             // Normalize tag data before saving
//             // const tagsArray = tagsInstance.value.map(tagData => ({
//             //     text:  tagData.value,
//             //     value:  uuidv4()
//             // }));

//             // *** want to understand this code, the entire syntax. ***
//             const tagsArray = tagsInstance.value.map(tagData => ({
//                 value: tagData.value,
//                 isValid: true,
//                 tagId: tagData.tagId || uuidv4()
//             }));

//             // This need to be the correct version.

//             // const tagsArray = tagsInstance.value.map(tagData => ({
//             //     text: tagData.value,
//             //     isValid: true,
//             //     value: tagData.tagId || uuidv4()
//             // }));

//             // Add new custom tags to user's collection
//             tagsArray.forEach(tag => {
//                 if (!whitelistTags.includes(tag.value)){
//                     user.customTags.add(tag);
//                 }
//             });

//             // Add new custom tags to user's collection
//             // tagsArray.forEach(tag => {
//             //     // if (!whitelistTags.includes(tag.text)) {
//             //     //     user.customTags.add(tag);
//             //     // }

//             //     if (!whitelistTags.some(wt => wt.value === tag.value)) {
//             //         user.customTags.add(tag);
//             //     }
//             // });

//             // Directly converting the tagsArray to tagsSet over iterating it for better efficiency.
//             task.tagsSet = new Set(tagsArray);
//             localStorage.setItem(user.username, JSON.stringify(user.toData()));
//             updateTaskCardTags(task); // Update the task card display

//             // Clear the Tagify input and tag chips in the modal - old version
//             // tagsInstance.removeAllTags(); // Clear Tagify's state
//             // updateTagContainer(); // Clear the displayed chips
//             // input.value = ''; // Clear the input field

//             // New version, clear the tagify input
//             tagsInstance.removeAllTags();
//             input.value = '';
//             tagContainer.innerHTML = '';


//             tagModal.style.display = 'none';
//         }
//     });
//     return tagsInstance;
// }

// // updateTaskCardTags() code is related to which part of flow or tag implementation.
// function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     console.log("task id is , inside udpateTaskCardFun ", task.task_id)

//     // This condition is redundant because tags can only be added via cards not from anywhere else.
//     if (!taskCard) return;

//     // Redundant code
//     const tagsContainer = taskCard.querySelector('.tags-container');

//     // Redundant code
//     if (!tagsContainer) return;

//     tagsContainer.innerHTML = '';

//     task.tagsSet.forEach(tag => {
//         const tagElement = document.createElement('span');
//         tagElement.className = 'task-tag tagify__tag'; // Add Tagify class for consistent styling
//         tagElement.textContent = tag.value;
//         tagElement.dataset.tagId = tag.tagId;
//         tagsContainer.appendChild(tagElement);
//     });

// }

// ###### Last version of code or 5th version ######

// export function tagHandler(user, predefinedTags, tagModal) {

//     // console.log('Modal Task ID: ', tagModal.dataset.taskid);


//     // Robust element selection with fallback
//     const input = document.querySelector('input[name="task-tags"]');
//     const tagContainer = document.querySelector('#tagify-container');
//     const saveTagBtn = document.getElementById('save-tag');

//     // Comprehensive cleanup mechanism
//     // if (input.tagify) {
//     //     input.tagify.destroy();
//     //     input.tagify = null;
//     //     // delete input.tagify;  // Ensure complete removal
//     //     // Added later
//     //     // input.removeAttribute('readonly');
//     //     // input.removeAttribute('data-tagify'); // Remove Tagify-specific attribute
//     // }

//     if (input.tagify) {
//         console.log('Destroying previous Tagify instance...');
//         input.tagify.destroy();
//         input.tagify = null; // Ensure the instance is completely removed
//         input.removeAttribute('data-tagify'); // Remove Tagify-specific attribute
//         input.removeAttribute('readonly'); // Ensure the input is editable
//         input.removeAttribute('disabled');
//     }

//     // Reset input and container states
//     // Basically reseting the input field's value and attributes before initializing tagify.
//     // input.value = '';
//     // input.innerHTML = ''; // Added now
//     // tagContainer.innerHTML = '';

//     // More code for knowing the issue

//     // Reset input field attributes
//     input.value = '';
//     input.innerHTML = '';
//     input.style.display = 'block'; // Ensure the input field is visible
//     input.style.visibility = 'visible';
//     input.style.opacity = '1';

//     console.log('Input Field State:', {
//         value: input.value,
//         innerHTML: input.innerHTML,
//         readonly: input.readOnly,
//         disabled: input.disabled,
//         display: input.style.display,
//         visibility: input.style.visibility,
//         opacity: input.style.opacity,
//     });

//     // Dynamic tag list generation
//     const customTags = Array.from(user.customTags).map(tag => ({
//         value: tag.value || tag.text,
//         text: tag.text || tag.value
//     }));

//     const whitelistTags = [
//         ...predefinedTags,
//         ...customTags
//     ];

//     // Enhanced Tagify configuration
//     console.log('Initializing Tagify...');
//     const tagsInstance = new Tagify(input, {
//         whitelist: whitelistTags,
//         maxTags: 5,
//         duplicates: false,
//         mode: 'select',
//         skipInvalid: true,
//         transformTag: (tagData) => {
//             // Standardize tag data
//             tagData.value = tagData.value.trim();
//             tagData.tagId = tagData.tagId || uuidv4();
//         },
//         classNames: {
//             input: 'tagify__input--outside',
//             scope: 'tagify--outside'
//         },
//         dropdown: {
//             enabled: 1,
//             maxItems: 5,
//             position: "text",
//             closeOnSelect: false,
//             highlightFirst: true,
//             placeAbove: false,
//             clearOnSelect: false,
//             fuzzySearch: false,
//             sortby: "startsWith",
//             backspace: false,
//             keepInvalidTags: true,
//             createInvalidTags: false,
//             mode: 'mix',
//             placeholder: "Enter tags...",
//             enforceWhitelist: true,
//             addTagOn: ["enter"]

//         },
//         validation: {
//             validate: (tag) => {
//                 const tagText = typeof tag === 'string' ? tag : (tag.text || tag.value);
//                 const trimmedTag = tagText.trim();

//                 if (trimmedTag.length < 3) return "Tag must be 3-20 characters";
//                 if (trimmedTag.length > 20) return "Tag must be 3-20 characters";
//                 if (!/^[a-zA-Z0-9.@\-_]+$/.test(trimmedTag)) return "Invalid characters";

//                 return true;
//             }
//         },
//         callbacks: {
//             add: updateTagContainer,
//             invalid: handleInvalidTag
//         }
//     });

//     console.log("Tagify Instance: ", tagsInstance);
//     console.log('Input Element: ', input);
//     console.log('Existing Tagify Instance: ', input.tagify);

//     input.addEventListener('focus', () => {
//         console.log('Input field focused.');
//     });
//     // Load existing task tags
//     const taskId = tagModal.dataset.taskid;
//     const currentTask = user.taskList.find(task => task.task_id === taskId);
//     if (currentTask?.tagsSet) {
//         const existingTags = Array.from(currentTask.tagsSet);
//         if (existingTags.length) {
//             tagsInstance.addTags(existingTags.map(tag => tag.value));
//         }
//     }

//     function updateTagContainer() {
//         tagContainer.innerHTML = '';
//         tagsInstance.value.forEach(tagData => {
//             const tagElm = document.createElement('span');
//             tagElm.className = 'task-tag';
//             tagElm.innerHTML = `
//                 ${tagData.value}
//                 <span class='remove-tag'>&times;</span>
//             `;

//             tagElm.querySelector('.remove-tag').addEventListener('click', () => {
//                 tagsInstance.removeTags(tagData.value);
//             });

//             tagContainer.appendChild(tagElm);
//         });
//     }

//     function handleInvalidTag({ errors }) {
//         if (errors?.length) {
//             const errorContainer = document.createElement('div');
//             errorContainer.className = 'tag-error-container';
//             errorContainer.textContent = errors[0];
//             tagContainer.appendChild(errorContainer);
//             setTimeout(() => errorContainer.remove(), 3000);
//         }
//     }

//     // Enhanced save mechanism
//     saveTagBtn.addEventListener('click', () => {
//         const task = user.taskList.find(task => task.task_id === taskId);
//         if (task) {
//             const tagsArray = tagsInstance.value.map(tagData => ({
//                 value: tagData.value,
//                 tagId: tagData.tagId || uuidv4(),
//                 isValid: true
//             }));

//             // Update custom tags
//             tagsArray.forEach(tag => {
//                 if (!whitelistTags.some(wl => wl.text === tag.value)) {
//                     user.customTags.add(tag);
//                 }
//             });

//             task.tagsSet = new Set(tagsArray);
//             localStorage.setItem(user.username, JSON.stringify(user.toData()));
//             updateTaskCardTags(task);

//             // Complete cleanup
//             tagsInstance.removeAllTags();
//             input.value = '';
//             tagContainer.innerHTML = '';
//             tagModal.style.display = 'none';
//         }
//     });

//     return tagsInstance;
// }

// function updateTaskCardTags(task) {
//     const taskCard = document.querySelector(`[data-task-id="${task.task_id}"]`);
//     if (!taskCard) return;

//     const tagsContainer = taskCard.querySelector('.tags-container');
//     if (!tagsContainer) return;

//     tagsContainer.innerHTML = '';
//     task.tagsSet.forEach(tag => {
//         const tagElement = document.createElement('span');
//         tagElement.className = 'task-tag';
//         tagElement.textContent = tag.value;
//         tagElement.dataset.tagId = tag.tagId;
//         tagsContainer.appendChild(tagElement);
//     });
// }