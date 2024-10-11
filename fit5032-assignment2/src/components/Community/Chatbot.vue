<template>
  <div class="chatbot container mt-4">
    <div class="chat-window card">
      <div class="card-body chat-messages">
        <div v-for="(message, index) in messages" :key="index" class="message mb-3">
          <div class="d-flex" :class="{'justify-content-end': message.isUser, 'justify-content-start': !message.isUser}">
            <p :class="{'user-message': message.isUser, 'bot-message': !message.isUser, 'p-2': true, 'rounded': true}">
              {{ message.text }}
            </p>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="input-group">
          <input
            v-model="userMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
            class="form-control"
          />
          <button @click="sendMessage" class="btn btn-primary">Send</button>
        </div>
        <div class="mt-3">
          <p>Try one of these prompts:</p>
          <div class="btn-group">
            <button @click="setPrompt('What’s the weather today?')" class="btn btn-outline-secondary">Weather</button>
            <button @click="setPrompt('Tell me a joke!')" class="btn btn-outline-secondary">Joke</button>
            <button @click="setPrompt('Give me some advice.')" class="btn btn-outline-secondary">Advice</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const userMessage = ref('');
const messages = ref([]);

const cloudFunctionUrl = 'https://australia-southeast1-ishita-assignment3.cloudfunctions.net/chatbotAPI';

const setPrompt = (text) => {
  userMessage.value = text;
};

const sendMessage = async () => {
  try {
    if (!userMessage.value) {
      return;
    }

    const response = await axios.post(cloudFunctionUrl, { message: userMessage.value });

    const botReply = response.data.reply;

    messages.value.push({ text: userMessage.value, isUser: true });
    messages.value.push({ text: botReply, isUser: false });
    console.log(botReply)
    userMessage.value = '';
  } catch (error) {
    messages.value.push({ text: 'An error occurred while sending your message.', isUser: false });
  }
};
</script>

<style scoped>
.chat-window {
  max-width: 600px;
  margin: 0 auto;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9f9f9;
}

.user-message {
  background-color: #d1ffd6;
  text-align: right;
  max-width: 75%;
}

.bot-message {
  background-color: #e0e0e0;
  text-align: left;
  max-width: 75%;
}

input {
  margin-right: 10px;
}

button {
  width: 100px;
}
</style>
