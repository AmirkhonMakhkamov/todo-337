const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Initialize environment variables and database
dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Serve static files from the public_html folder
app.use(express.static(path.join(__dirname, '../public_html')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);

// Fallback to index.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public_html', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000; // 5000 is busy in my local machine
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));