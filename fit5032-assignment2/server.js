import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { config } from 'dotenv'; // Import dotenv to load environment variables

config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
console.log(GEMINI_API_KEY)

// Gemini API URL
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCW3vZ-BJOq7mix_7nfVyc6inm-5o93G0E'; 

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Debugging: Log the incoming message
  console.log('Received message:', message);

  // Check if the message is provided
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Call the Gemini API
    const response = await axios.post(GEMINI_API_URL, {
      input: message,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`, // Use process.env for API key
        'Content-Type': 'application/json',
      }
    });

    // Debugging: Log the API response
    console.log('Gemini API response:', response.data);

    // Extract the bot's reply from the API response
    const botReply = response.data.reply; // Adjust based on the actual response structure

    // Send the bot's reply back to the client
    res.json({ reply: botReply });
    
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);

    // Log specific error details if available
    if (error.response) {
      console.error('API responded with status:', error.response.status);
      console.error('API response data:', error.response.data);
      return res.status(error.response.status).json({ error: error.response.data.message || "I'm sorry, there was an error processing your request." });
    }

    // General error response
    res.status(500).json({ error: "I'm sorry, there was an error processing your request." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
