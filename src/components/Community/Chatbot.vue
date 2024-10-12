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
            <button
              v-for="prompt in getDynamicPrompts()"
              :key="prompt.text"
              @click="setPrompt(prompt.text)"
              class="btn btn-outline-secondary"
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

    messages.value.push({ text: userMessage.value, isUser: true });
    const lines = botReply[0].content.parts[0].text.split('\n');


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
