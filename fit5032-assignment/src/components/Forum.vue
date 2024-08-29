<template>
    <h1 class="text-center my-4">Welcome to the Forum</h1>
    <div>
        <button class="text-success align-centre" @click = "newPost"> New post </button>
    </div>

</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const newPost = () => {
        router.push('/newpost')
    };
    
</script>

<style scoped>


</style>