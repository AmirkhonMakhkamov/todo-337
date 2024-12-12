const Task = require('../models/taskModel');
const User = require('../models/userModel');
const { createActivity } = require('./activityController');

// Create a new task
const createTask = async (req, res) => {
    const { title, description, progress, dueDate, priority, owner } = req.body;

    try {
        const task = await Task.create({
            title, description, progress, dueDate, priority, owner
        });

        // Log activity
        await createActivity(
            task._id,
            owner,
            'created',
            `Task "${title}" was created`
        );

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all tasks for a user
const getTasks = async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters

    try {
        const tasks = await Task.find({
            $or: [
                { owner: userId },
                { sharedWith: userId }
            ]
        }).sort({ dueDate: 1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's own tasks
const getUserTasks = async (req, res) => {
    const { userId } = req.query;

    try {
        const tasks = await Task.find({
            owner: userId
        }).sort({ dueDate: 1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tasks shared with the user
const getSharedTasks = async (req, res) => {
    const { userId } = req.query;

    try {
        const tasks = await Task.find({
            sharedWith: userId
        })
            .populate('owner', 'username')
            .sort({ dueDate: 1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Share a task with another user
const shareTask = async (req, res) => {
    const { taskId, userId, ownerId } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!task.owner.equals(ownerId)) {
            return res.status(403).json({ message: 'You can only share your own tasks' });
        }

        if (task.sharedWith.includes(userId)) {
            return res.status(400).json({ message: 'Task already shared with this user' });
        }

        // Fetch the target user's information
        const targetUser = await User.findById(userId);

        let targetUsername = '';
        if (targetUser) {
            targetUsername = targetUser.username;
        }

        task.sharedWith.push(userId);
        await task.save();

        // Log activity
        await createActivity(
            taskId,
            ownerId,
            'shared',
            `Task was shared with @${targetUsername}`
        );

        res.status(200).json({ message: 'Task shared successfully', task });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update task details
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, progress, dueDate, priority, ownerId } = req.body;
    // ownerId is added to verify ownership

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // if (!task.owner.equals(ownerId)) {
        //     return res.status(403).json({ message: 'You can only update your own tasks' });
        // }

        // Store old values for activity log
        const changes = [];
        if (title && title !== task.title) changes.push('title');
        if (description && description !== task.description) changes.push('description');
        if (progress && progress !== task.progress) changes.push('progress');
        if (dueDate && dueDate !== task.dueDate) changes.push('due date');
        if (priority && priority !== task.priority) changes.push('priority');

        task.title = title || task.title;
        task.description = description || task.description;
        task.progress = progress || task.progress;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;

        await task.save();

        // Log activity if there were changes
        if (changes.length > 0) {
            await createActivity(
                id,
                ownerId,
                'updated',
                `Updated ${changes.join(', ')}`
            );
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a task or remove from shared list
const deleteTask = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; // Changed from ownerId to userId for more general use

    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // If user is the owner - delete the task completely
        if (task.owner.equals(userId)) {
            // Log activity before deletion
            await createActivity(
                id,
                userId,
                'deleted',
                'Task was deleted'
            );

            await task.deleteOne();

            return res.status(200).json({ message: 'Task deleted successfully' });
        } else if (task.sharedWith.includes(userId)) { // If user is not the owner but the task is shared with them
            // Remove user from sharedWith array
            task.sharedWith = task.sharedWith.filter(id => !id.equals(userId));

            await task.save();

            // Log activity
            await createActivity(
                id,
                userId,
                'unshared',
                'User removed from shared list'
            );

            return res.status(200).json({ message: 'Task removed from your shared list' });
        }

        // If user is neither owner nor in sharedWith list
        return res.status(403).json({ message: 'You do not have permission to modify this task' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getUserTasks,
    getSharedTasks,
    shareTask,
    updateTask,
    deleteTask
};