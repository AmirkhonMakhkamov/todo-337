// Get task ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('taskId');

// Select the form
const updateTaskForm = document.getElementById('updateTask');
const shareTaskForm = document.getElementById('shareTask');
const deleteTaskButton = document.getElementById('deleteTask');

function disableForm() {
    const formElements = updateTaskForm.elements;
    for (let element of formElements) {
        element.disabled = true;
    }
}

function enableForm() {
    const formElements = updateTaskForm.elements;
    for (let element of formElements) {
        element.disabled = false;
    }
}

// Core function to fetch data
async function fetchTaskData(taskId, userId) {
    const [taskResponse, usersResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/tasks/?userId=${userId}`),
        fetch('/api/auth/users'),
        fetch(`/api/activities/task/${taskId}`)
    ]);

    if (!taskResponse.ok) {
        alert('Failed to fetch task data');
        return;
    }

    if (!usersResponse.ok) {
        alert('Failed to fetch users');
        return;
    }

    if (!activitiesResponse.ok) {
        alert('Failed to fetch activities');
        return;
    }

    const [tasks, users, activities] = await Promise.all([
        taskResponse.json(),
        usersResponse.json(),
        activitiesResponse.json()
    ]);

    const task = tasks.find(t => t._id === taskId);
    if (!task) throw new Error('Task not found');

    return { task, users, activities };
}

// Fill form fields
function fillFormFields(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;

    const dueDate = new Date(task.dueDate);
    const tzOffset = dueDate.getTimezoneOffset() * 60000; // Convert offset to milliseconds
    const localDate = new Date(dueDate.getTime() - tzOffset); // Adjust for local timezone
    document.getElementById('dueDate').value = localDate.toISOString().slice(0, 16);

    document.getElementById('priority').value = task.priority;

    if (document.getElementById('progress')) {
        document.getElementById('progress').value = task.progress;
    }
}

// Display shared users
function displaySharedUsers(task, users) {
    const sharedWithContainer = document.getElementById('sharedWith').querySelector('.d-flex');
    if (!sharedWithContainer) return;

    sharedWithContainer.innerHTML = '';

    if (task.sharedWith?.length > 0) {
        task.sharedWith.forEach(sharedUserId => {
            const sharedUser = users.find(u => u._id === sharedUserId);
            if (sharedUser) {
                const userBadge = document.createElement('p');
                userBadge.className = 'bg-success py-1 px-3 rounded-5 text-white m-1';
                userBadge.textContent = sharedUser.username;
                sharedWithContainer.appendChild(userBadge);
            }
        });
    } else {
        sharedWithContainer.innerHTML = '<p class="text-muted m-1">No users shared with this task</p>';
    }
}

// Display activities
function displayActivities(activities) {
    const activityTable = document.getElementById('activity');
    if (!activityTable) return;

    const tbody = activityTable.querySelector('tbody');
    tbody.innerHTML = '';

    if (activities?.length > 0) {
        activities.forEach(activity => {
            const row = document.createElement('tr');

            // Background colors for different actions
            const bgClassMap = {
                created: 'bg-success',
                updated: 'bg-warning',
                unshared: 'bg-danger',
                removed: 'bg-danger',
                shared: 'bg-info',
                completed: 'bg-success'
            };

            // Format date
            const date = new Date(activity.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            // Find username
            const user = activity.user;
            const username = user ? user.username : 'Unknown user';

            // Create table row content
            row.innerHTML = `
                <td>${username}</td>
                <td><span class="${bgClassMap[activity.action] || 'bg-primary'} py-1 px-3 rounded-5 text-white text-center m-0">${activity.action}</span></td>
                <td>${activity.details || '-'}</td>
                <td>${formattedDate}</td>
            `;

            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-muted text-center">No activities recorded</td>
            </tr>
        `;
    }
}

// Populate share select
function populateShareSelect(task, users, userId) {
    const shareWithSelect = document.getElementById('shareWithUser');
    if (!shareWithSelect) return;

    shareWithSelect.innerHTML = '<option value="">Select</option>';

    const availableUsers = users.filter(user =>
        user._id !== userId &&
        !task.sharedWith?.includes(user._id)
    );

    availableUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user._id;
        option.textContent = user.username;
        shareWithSelect.appendChild(option);
    });
}

// Main function
async function loadTaskData() {
    if (!userId) {
        showNotification('Unable to fetch user', 'error');
        return;
    }

    disableForm();

    try {
        const { task, users, activities } = await fetchTaskData(taskId, userId);

        fillFormFields(task);
        displaySharedUsers(task, users);
        displayActivities(activities, users);
        populateShareSelect(task, users, userId);

    } catch (error) {
        console.error('Error loading task:', error);
        showNotification(error.message, 'error');
    } finally {
        enableForm();
    }
}

// Handle form submission for updates
updateTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!userId) {
        showNotification('Unable to fetch user', 'error');
        return;
    }

    try {

        if (!validateForm()) {
            return;
        }

        // Get form data
        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            dueDate: document.getElementById('dueDate').value,
            priority: document.getElementById('priority').value,
            progress: document.getElementById('progress').value,
            ownerId: userId
        };

        // Send PUT request to update task
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadTaskData().then(async () => {
                showNotification('Task updated successfully!', 'success');
            });
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to update task');
        }

    } catch (error) {
        console.error('Error updating task:', error);
        showNotification(error.message, 'error');
    }
});

shareTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!userId) {
        showNotification('Unable to fetch user', 'error');
        return;
    }

    try {
        // Make form data
        const formData = {
            taskId: taskId,
            userId: document.getElementById('shareWithUser').value,
            ownerId: userId,
        };

        // Send PUT request to update task
        const response = await fetch(`/api/tasks/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            loadTaskData().then(async () => {
                const shareTaskModal = bootstrap.Modal.getInstance(document.getElementById('shareTaskModal'));
                shareTaskModal.hide();

                const result = await response.json();
                showNotification(result.message, 'success');
            });
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to share task');
        }

    } catch (error) {
        console.error('Error updating task:', error);
        showNotification(error.message, 'error');
    }
});

deleteTaskButton.addEventListener('click', async () => {
    if (!userId) {
        showNotification('Unable to fetch user', 'error');
        return;
    }

    try {
        // Disable the delete button while processing
        deleteTaskButton.disabled = true;

        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (response.ok) {
            const deleteTaskModal = bootstrap.Modal.getInstance(document.getElementById('deleteTaskModal'));
            deleteTaskModal.hide();

            const result = await response.json();
            showNotification(result.message, 'success');

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 500);
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to delete task');
        }

    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification(error.message, 'error');
        deleteTaskButton.disabled = false;
    }
});

loadTaskData().then(
    () => {

    }
);