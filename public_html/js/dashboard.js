const userId = localStorage.getItem('todo_tasks_uid');

if (!userId) {
    localStorage.clear();
    window.location.href = '/';
}

let loader = null;

function createLoader() {
    const loaderElement = document.createElement('div');
    loaderElement.className = 'position-fixed top-0 start-0 w-100 vh-100 d-flex align-items-center justify-content-center text-center bg-white z-3';
    loaderElement.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    document.body.appendChild(loaderElement);
    return loaderElement;
}

function createHeader(username) {
    const header = document.createElement('header');
    header.className = 'fixed-top border bg-white shadow-sm p-3 z-2';

    header.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex justify-content-center align-items-center cursor-pointer" onclick="window.location.href='/dashboard/'">
                <i class="lni lni-check-square-2 font-50 text-primary d-block"></i>
                <h3 class="text-primary">TODO Tasks</h3>
            </div>

            <div class="d-flex align-items-center">
                <p>Hello, <span class="text-capitalize">${username}</span></p>

                <button type="button" id="logout" class="ms-4 btn btn-light border">
                    Logout
                </button>
            </div>
        </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);
    return header;
}

const fetchUsername = async () => {
    try {
        const response = await fetch(`/api/auth/user/${userId}`);
        if (!response.ok) {
            alert('Failed to fetch username');
        }
        const user = await response.json();
        return user.username;
    } catch (error) {
        console.error(error.message);
        alert('Failed to fetch user');
        window.location.href = '/';
    }
};

const initializeDashboard = async () => {
    loader = createLoader();

    const username = await fetchUsername();

    createHeader(username);

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('todo_tasks_uid');
        window.location.href = '/';
    });
};

initializeDashboard().then(
    () => {
        if (loader) {
            loader.remove();
        }
    }
);