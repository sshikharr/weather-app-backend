const express = require('express');
const { searchWeather, getWeatherHistory } = require('../controllers/weatherController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Weather Search Route
router.post('/weather-fetch', authenticateToken, searchWeather);

// Weather Search History Route
router.get('/weather-history', authenticateToken, getWeatherHistory);

module.exports = router;