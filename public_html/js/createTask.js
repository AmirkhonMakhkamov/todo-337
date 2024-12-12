const createTaskForm = document.getElementById('createTask');

createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        if (!validateForm()) {
            return;
        }

        if (!userId) {
            showNotification('Unable to fetch user', 'error');
        }

        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            dueDate: document.getElementById('dueDate').value,
            priority: document.getElementById('priority').value,
            progress: 'in-progress',
            owner: userId
        };

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to create task');
        }

        const newTask = await response.json();

        createTaskForm.reset();

        showNotification('Task created successfully!', 'success');

    } catch (error) {
        console.error('Error creating task:', error);
        showNotification(error.message, 'error');
    }
});