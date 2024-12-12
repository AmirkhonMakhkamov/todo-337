const myTasksContainer = document.getElementById('my-tasks');
const sharedTasksContainer = document.getElementById('shared-tasks');

const fetchTasks = async () => {
    try {
        myTasksContainer.innerHTML = '<div class="col-12">Loading your tasks...</div>';
        sharedTasksContainer.innerHTML = '<div class="col-12">Loading shared tasks...</div>';

        const [ownResponse, sharedResponse] = await Promise.all([
            fetch(`/api/tasks/own?userId=${userId}`),
            fetch(`/api/tasks/shared?userId=${userId}`)
        ]);

        if (!ownResponse.ok || !sharedResponse.ok) {
            alert('Failed to fetch tasks');
        }

        const [ownTasks, sharedTasks] = await Promise.all([
            ownResponse.json(),
            sharedResponse.json()
        ]);

        myTasksContainer.innerHTML = '';
        sharedTasksContainer.innerHTML = '';

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        };

        const createTaskCard = (task) => {
            const taskCard = document.createElement('div');
            taskCard.className = 'col-12 col-md-6 col-lg-4 mb-3';

            const getPriorityColor = (priority) => {
                const colors = {
                    low: 'text-success',
                    medium: 'text-warning',
                    high: 'text-danger'
                };
                return colors[priority.toLowerCase()] || 'text-muted';
            };

            taskCard.innerHTML = `
                <div class="border rounded p-3">
                    <div class="mb-3 border-bottom pb-3">
                        <h3>${task.title}</h3>
                        <p>${task.description || 'No description provided.'}</p>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p>Priority: <small class="${getPriorityColor(task.priority)} text-capitalize">${task.priority}</small></p>
                            <p>Due date: <small class="text-muted">${formatDate(task.dueDate)}</small></p>
                            <p>Progress: <small class="text-muted text-capitalize">${task.progress}</small></p>
                        </div>

                        <div>
                            <a href="/dashboard/tasks/?taskId=${task._id}" class="btn btn-outline-primary">
                                Details
                            </a>
                        </div>
                    </div>
                </div>
            `;

            return taskCard;
        };

        if (ownTasks.length === 0) {
            myTasksContainer.innerHTML = '<div class="col-12 text-center">You have no tasks</div>';
        } else {
            ownTasks.forEach(task => {
                myTasksContainer.appendChild(createTaskCard(task));
            });
        }

        if (sharedTasks.length === 0) {
            sharedTasksContainer.innerHTML = '<div class="col-12 text-center">No tasks shared with you</div>';
        } else {
            sharedTasks.forEach(task => {
                const taskCard = createTaskCard(task);
                const taskInfo = taskCard.querySelector('.border-bottom');
                if (task.owner?.username) {
                    taskInfo.insertAdjacentHTML('beforeend',
                        `<p class="mt-2 mb-0"><small class="text-muted">Shared by: ${task.owner.username}</small></p>`
                    );
                }
                sharedTasksContainer.appendChild(taskCard);
            });
        }

    } catch (error) {
        console.error('Error:', error);
        const errorMessage = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load tasks: ${error.message}
                </div>
            </div>
        `;
        myTasksContainer.innerHTML = errorMessage;
        sharedTasksContainer.innerHTML = errorMessage;
    }
};

const initializeTasks = async () => {
    if (userId) {
        await fetchTasks();
    }

};

initializeTasks().then(
    () => {}
);