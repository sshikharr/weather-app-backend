const axios = require('axios');
const { pool } = require('../config/db');
require('dotenv').config();

const searchWeather = async (req, res) => {
  try {
    const { city } = req.body;

    // Fetch weather from weatherstack API
    const weatherResponse = await axios.get('http://api.weatherstack.com/current', {
      params: {
        access_key: process.env.WEATHERSTACK_API_KEY,
        query: city
      }
    });

    // Checking if the location is valid or not
    if(weatherResponse.data.success === false){
        res.status(400).json({
            message: 'Please enter a valid location'
        })
    }else{
        // Save search to database
        await pool.execute(
        'INSERT INTO weather_searches (user_id, city, weather_data) VALUES (?, ?, ?)', 
        [req.user.id, city, JSON.stringify(weatherResponse.data)]
        );
        res.json(weatherResponse.data);
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching weather', 
      error: error.response ? error.response.data : error.message 
    });
  }
};

// Weather Search History Controller
const getWeatherHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [searches] = await pool.execute(
      `SELECT ws.*, u.username 
       FROM weather_searches ws 
       JOIN users u ON ws.user_id = u.id 
       WHERE ws.user_id = ? 
       ORDER BY ws.search_date DESC`, 
      [req.user.id]
    );

    // Modify parsing to handle different potential data formats
    const parsedSearches = searches.map(search => {
      try {
        // Try parsing as JSON if it's a string
        const weatherData = typeof search.weather_data === 'string' 
          ? JSON.parse(search.weather_data) 
          : search.weather_data;

        return {
          ...search,
          weather_data: weatherData
        };
      } catch (parseError) {
        console.error('Error parsing weather_data:', parseError);
        return {
          ...search,
          weather_data: search.weather_data // Keep original if parsing fails
        };
      }
    });

    res.json(parsedSearches);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching search history', 
      error: error.message 
    });
  }
};

module.exports = { searchWeather, getWeatherHistory };