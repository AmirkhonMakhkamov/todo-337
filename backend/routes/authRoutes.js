const express = require('express');
const { registerUser, loginUser, getUser, getUsers } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user/:id', getUser);
router.get('/users', getUsers);

module.exports = router;