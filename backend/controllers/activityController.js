const Activity = require('../models/activityModel');

// Get activities for a specific task
const getTaskActivities = async (req, res) => {
    const { taskId } = req.params;

    try {
        const activities = await Activity.find({ task: taskId })
            .populate('user', 'username')
            .sort({ timestamp: -1 });

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create activity log
const createActivity = async (taskId, userId, action, details = '') => {
    try {
        await Activity.create({
            task: taskId,
            user: userId,
            action,
            details
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};

module.exports = { getTaskActivities, createActivity };