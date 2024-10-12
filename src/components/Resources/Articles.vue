<template>
  <div class="container mt-4">
    <h3 class="text-center mb-4">Flood Firestore with Forum Posts</h3>

    <button class="btn btn-danger" @click="floodFirestore">Create 20 Sample Posts</button>

    <div v-if="loading" class="mt-3">Creating posts, please wait...</div>
    <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

const loading = ref(false)
const successMessage = ref('')

const floodFirestore = async () => {
  loading.value = true
  successMessage.value = ''
  
  const db = getFirestore()
  const postsCollection = collection(db, 'posts')

  const titles = [
    "Understanding Vue 3: A Comprehensive Guide",
    "Top 10 Benefits of Using Firebase for Your App",
    "Getting Started with Vue Router in Your Projects",
    "How to Build Responsive Layouts with Bootstrap",
    "Creating Dynamic Forms in Vue: Best Practices",
    "A Beginner's Guide to Firestore Database",
    "The Importance of Accessibility in Web Development",
    "Integrating APIs into Your Vue.js Application",
    "Exploring the Features of Vuex for State Management",
    "Tips for Optimizing Performance in Vue Apps",
    "How to Handle User Authentication with Firebase",
    "Building a Simple Chat Application with Vue",
    "Advanced Techniques for Vue Component Design",
    "Creating Stunning UI with Bootstrap 5",
    "How to Deploy Your Vue.js App to Cloudflare Pages",
    "Understanding Lifecycle Hooks in Vue.js",
    "How to Use Props and Emit in Vue Components",
    "Debugging Vue Applications: Tools and Techniques",
    "Building a Blog with Vue.js and Firestore",
    "Using the Composition API for Cleaner Code",
    "Best Practices for Structuring Your Vue Project"
  ]

  const contents = [
    "In this post, we will explore the features and benefits of Vue 3 and how it can improve your development workflow. Learn about the new Composition API and how it changes the way we build components.",
    "Firebase offers numerous benefits for developers looking to build applications quickly. This post outlines the top 10 reasons why you should consider using Firebase for your next project.",
    "Vue Router is a powerful tool for building single-page applications. In this post, we will cover the basics of setting up and using Vue Router to manage your app's routes.",
    "Responsive design is essential in today’s web development. This post discusses how to leverage Bootstrap's grid system to create layouts that look great on any device.",
    "Dynamic forms are a common requirement in applications. Learn how to build efficient and user-friendly forms in Vue with tips and best practices.",
    "Firestore is a flexible, scalable database for mobile, web, and server development. In this post, we'll go through the steps to get started with Firestore and its key features.",
    "Accessibility is often overlooked in web development. This post emphasizes the importance of building accessible applications and provides tips on how to implement accessibility standards.",
    "Integrating APIs into your Vue application can be daunting. This post provides a step-by-step guide on how to seamlessly integrate third-party APIs.",
    "Vuex is a state management pattern + library for Vue.js applications. This post explains how to effectively use Vuex to manage state in your app.",
    "Performance is key to user satisfaction. In this post, we will discuss various techniques to optimize the performance of your Vue applications.",
    "User authentication is crucial for many applications. This post will show you how to implement user authentication using Firebase in your Vue.js apps.",
    "In this tutorial, we will build a simple chat application using Vue.js. We'll cover the key features and functionalities required to create a real-time chat experience.",
    "Building reusable components is vital for maintainable code. This post will share advanced techniques for designing Vue components that are both efficient and reusable.",
    "Bootstrap 5 is a powerful framework for creating beautiful UIs. This post discusses how to utilize Bootstrap to enhance the user experience of your Vue apps.",
    "Deploying your Vue.js application to Cloudflare Pages is easy and efficient. In this post, we will guide you through the deployment process step by step.",
    "Lifecycle hooks are essential for managing component behavior in Vue. This post will explain the different lifecycle hooks and when to use them in your applications.",
    "Props and emit are fundamental concepts in Vue components. In this post, we will delve into how to pass data and communicate between components effectively.",
    "Debugging is an essential skill for any developer. This post will introduce tools and techniques for effectively debugging your Vue applications.",
    "Creating a blog with Vue.js and Firestore can be a fun project. This post walks you through the steps to build a simple blog application using these technologies.",
    "The Composition API provides a more flexible way to organize and reuse code in Vue applications. This post discusses its benefits and how to get started.",
    "This post outlines best practices for structuring your Vue project to ensure scalability and maintainability."
  ]

  for (let i = 0; i < 20; i++) {
    await addDoc(postsCollection, {
      title: titles[i % titles.length], // Cycle through titles
      currentuser: `Author ${i + 1}`,
      content: contents[i % contents.length], // Cycle through contents
    })
  }

  loading.value = false
  successMessage.value = 'Successfully created 20 sample posts!'
}

onMounted(() => {
  // Automatically flood Firestore with posts when the component is mounted
  floodFirestore()
})
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
