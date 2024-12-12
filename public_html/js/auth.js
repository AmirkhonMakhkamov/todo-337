document.getElementById('auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();

    if (!username) {
        alert('Username cannot be empty.');
        return;
    }

    try {
        // log in user
        let response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (response.status === 404) {
            // If user not found -> register
            response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                alert('Failed to register');
            }
        } else if (!response.ok) {
            alert('Failed to log in.');
        }

        // On success redirect to the dashboard
        const data = await response.json();
        localStorage.setItem('todo_tasks_uid', data._id); // user ID
        window.location.href = '/dashboard'; // Redirect

    } catch (error) {
        alert(error.message);
    }
});