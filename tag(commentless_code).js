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
