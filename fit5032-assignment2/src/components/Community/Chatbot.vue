<template>
    <div class="chatbot">
      <div class="chat-window">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <p :class="{'user-message': message.isUser, 'bot-message': !message.isUser}">
            {{ message.text }}
          </p>
        </div>
      </div>
      <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="Type your message..." />
      <button @click="sendMessage">Send</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  const userMessage = ref('');
  const messages = ref([]);
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  console.log(GEMINI_API_KEY)

  
  // Function to send a message to the chatbot API
  const sendMessage = async () => {
  try {
    if (!userMessage.value) {
      console.warn('Empty message sent');
      return; // Prevent unnecessary API calls for empty messages
    }
    console.log(userMessage.value);
    
    // Construct the API URL with the environment variable
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    // Prepare the data structure according to the curl command
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: userMessage.value,
            },
          ],
        },
      ],
    };

    // Make the API request
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Extract the bot's reply from the API response
    const botReply = extractBotReply(response.data);
    
    // Add messages to the list
    messages.value.push({ text: userMessage.value, isUser: true });
    messages.value.push({ text: botReply, isUser: false });

    userMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    messages.value.push({ text: 'An error occurred while sending your message.', isUser: false });
  }
};

// Function to extract the bot reply from the API response
const extractBotReply = (data) => {
  // Check if the response structure is as expected
  if (data && data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return candidate.content.parts[0].text;
    }
  }
  return 'Sorry, I could not understand your request.';
};

  </script>
  
  <style scoped>
  .chatbot {
    width: 400px;
    margin: 0 auto;
  }
  .chat-window {
    border: 1px solid #ccc;
    padding: 10px;
    height: 300px;
    overflow-y: scroll;
  }
  .message {
    margin-bottom: 10px;
  }
  .user-message {
    text-align: right;
    background-color: #e1ffc7;
  }
  .bot-message {
    text-align: left;
    background-color: #f1f1f1;
  }
  input {
    width: calc(100% - 20px);
    padding: 10px;
    margin-top: 10px;
  }
  button {
    padding: 10px;
    width: 100%;
  }
  </style>
  