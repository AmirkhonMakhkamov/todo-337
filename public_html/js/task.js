function showNotification(message, type) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'position-fixed top-0 end-0 z-3 col-12 col-md-6 col-lg-4 p-3';
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <i class="lni lni-bug-1"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);

    // document.querySelector('.container').insertBefore(alertDiv, createTaskForm);
    document.body.appendChild(alertContainer);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function validateForm() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('dueDate').value;

    if (!title) {
        showNotification('Title is required', 'error');
        return false;
    }

    if (!description) {
        showNotification('Description is required', 'error');
        return false;
    }

    if (!dueDate) {
        showNotification('Due date is required', 'error');
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    if (selectedDate < today) {
        showNotification('Due date cannot be in the past', 'error');
        return false;
    }

    return true;
}