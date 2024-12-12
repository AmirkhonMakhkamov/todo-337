const express = require('express');
const { getTaskActivities } = require('../controllers/activityController');

const router = express.Router();

router.get('/task/:taskId', getTaskActivities);

module.exports = router;