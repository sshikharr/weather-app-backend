const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Database on Server Start
initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});