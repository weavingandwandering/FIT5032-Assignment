<template>
  <div class="chatbot container mt-4" role="application" aria-label="Chatbot">
    <div class="chat-window card" aria-live="polite" aria-relevant="additions">
      <div class="card-header text-center">
        <h2>Talk to Our AI Chatbot</h2>
        <p>Ask questions, get advice, or just have a chat!</p>
      </div>
      <div class="card-body chat-messages" tabindex="0" aria-label="Chat messages">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message mb-3"
          :aria-live="message.isUser ? 'polite' : 'assertive'"
        >
          <div class="d-flex" :class="{'justify-content-end': message.isUser, 'justify-content-start': !message.isUser}">
            <p
              :class="{'user-message': message.isUser, 'bot-message': !message.isUser, 'p-2': true, 'rounded': true}"
              role="text"
              aria-label="Chat message"
            >
              {{ message.text }}
            </p>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div class="input-group" aria-label="Message input group">
          <input
            v-model="userMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
            class="form-control"
            aria-label="Message input"
            required
            aria-required="true"
          />
          <button @click="sendMessage" class="btn btn-primary" aria-label="Send message">Send</button>
        </div>
        <div class="mt-3">
          <p>Try one of these prompts:</p>
          <div class="btn-group">
            <button
              v-for="prompt in getDynamicPrompts()"
              :key="prompt.text"
              @click="setPrompt(prompt.text)"
              class="btn btn-outline-secondary"
              aria-label="Dynamic prompt"
            >
              {{ prompt.text }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';

const userMessage = ref('');
const messages = ref([]);
const conversationContext = ref('');

const cloudFunctionUrl = 'https://australia-southeast1-ishita-assignment3.cloudfunctions.net/chatbotAPI';

const setPrompt = (text) => {
  userMessage.value = text;
};

const sendMessage = async () => {
  try {
    if (!userMessage.value) {
      return;
    }

    // Update conversation context based on user message
    if (userMessage.value.toLowerCase().includes('health')) {
      conversationContext.value = 'health';
    } else if (userMessage.value.toLowerCase().includes('joke')) {
      conversationContext.value = 'joke';
    } else if (userMessage.value.toLowerCase().includes('advice')) {
      conversationContext.value = 'advice';
    } else if (userMessage.value.toLowerCase().includes('fun')) {
      conversationContext.value = 'fun';
    } else {
      conversationContext.value = '';
    }

    const response = await axios.post(cloudFunctionUrl, { message: userMessage.value });

    const botReply = response.data.reply;

    // Add user message
    messages.value.push({ text: userMessage.value, isUser: true });
    const lines = botReply[0].content.parts[0].text.split('\n');

    // Add bot messages
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        messages.value.push({ text: trimmedLine, isUser: false });
      }
    });
    userMessage.value = '';
    
  } catch (error) {
    messages.value.push({ text: 'An error occurred while sending your message.', isUser: false });
  }
};

const getDynamicPrompts = () => {
  switch (conversationContext.value) {
    case 'joke':
      return [
        { text: "Tell me a funny story!", action: "setPrompt" },
        { text: "Do you have any puns?", action: "setPrompt" }
      ];
    case 'advice':
      return [
        { text: "Can you give me some life advice?", action: "setPrompt" },
        { text: "What should I do to improve my day?", action: "setPrompt" }
      ];
    case 'fun':
      return [
        { text: "What are some fun things to do this weekend?", action: "setPrompt" },
        { text: "Can you suggest a fun activity?", action: "setPrompt" }
      ];
    case 'health':
      return [
        { text: "How to maintain a healthy body?", action: "setPrompt" },
      ];
    default:
      return [
        { text: "Can you give me some advice?", action: "setPrompt" },
        { text: "Places to visit in Melbourne", action: "setPrompt" },
        { text: "Give ideas for hobbies", action: "setPrompt" }, 
        { text: "Important health checkups", action: "setPrompt" }
      ];
  }
};

const initializeChat = () => {
  messages.value.push({ text: `Hey ${localStorage.getItem('currentUser')}, how can I help you today?`, isUser: false });
}

onMounted(() => {
  initializeChat();
});
</script>

<style scoped>
.chat-window {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  background-color: #007bff;
  color: white;
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
