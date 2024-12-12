// const express = require('express');
// const {
//     getTasks,
//     createTask,
//     updateTask,
//     deleteTask,
// } = require('../controllers/taskController');
//
// const router = express.Router();
//
// router.get('/', getTasks);
// router.post('/', createTask);
// router.put('/:id', updateTask);
// router.delete('/:id', deleteTask);
//
// module.exports = router;


const express = require('express');

const {
    createTask,
    getTasks,
    getUserTasks,
    getSharedTasks,
    shareTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

// Task CRUD routes
router.post('/', createTask); // Create a task
router.get('/', getTasks); // Get all tasks for the user
router.get('/own', getUserTasks); // Get user's own tasks
router.get('/shared', getSharedTasks); // Get tasks shared with user
router.put('/:id', updateTask); // Update a task
router.delete('/:id', deleteTask); // Delete a task

// Task sharing route
router.post('/share', shareTask); // Share a task with another user

module.exports = router;