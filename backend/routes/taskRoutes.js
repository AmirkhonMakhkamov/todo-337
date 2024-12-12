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

router.post('/', createTask); // Create a task
router.get('/', getTasks); // Get all tasks for the user
router.get('/own', getUserTasks); // Get user's own tasks
router.get('/shared', getSharedTasks); // Get tasks shared with user
router.put('/:id', updateTask); // Update a task
router.delete('/:id', deleteTask); // Delete a task
router.post('/share', shareTask); // Share a task with another user

module.exports = router;