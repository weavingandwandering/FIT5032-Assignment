<template>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <form @submit.prevent="submitForm" class="p-4 border rounded">
            <div class="card-header">
              <h2>Create your New Post</h2>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="title" class="form-label">Title:</label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  placeholder="Enter the title"
                  @blur="() => validateTitle(true)" 
                  @input="() => validateTitle(false)"
                  v-model="formData.title"
                />
                <div v-if="error.title" class="text-danger"> {{error.title}} </div>

              </div>
              <div class="mb-3">
                <label for="content" class="form-label">Content:</label>
                <textarea
                  class="form-control"
                  id="content"
                  rows="7"
                  placeholder="Type your post content here"
                  @blur="() => validateContent(true)" 
                  @input="() => validateContent(false)"
                  v-model="formData.content"
                ></textarea>
                <div v-if="error.content" class="text-danger"> {{error.content}} </div>
              </div>
              <button type="submit" class="btn btn-success w-100" @click = "submitPost">Submit Post</button>
            </div>
        </form>
          </div>
        </div>
      </div>

    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'; 

  const router = useRouter();
  const formData = ref({
    title: '',
    content: '',
  });

  const error = ref({
    title: null,
    content: null,
  });
  //submits a new post after validation of content and title
  const submitPost = () =>{
    const id = JSON.parse(localStorage.getItem('idNo')) || [];
    const idNo = id.length + 1 
    validateContent();
    validateTitle();
    if(error.value.title == null && error.value.content == null ){
        savePost(idNo, formData.value.title, formData.value.content, localStorage.getItem('currentUser'));
        router.push('/forum');
    }


  }
  //saves the post to local Storage
  const savePost = (id, title, content, currentuser) => {
      const post = JSON.parse(localStorage.getItem('post')) || [];
      console.log(post);

      post.push({id, title, content, currentuser});
      localStorage.setItem('post', JSON.stringify(post));
      
      const idList = JSON.parse(localStorage.getItem('idNo')) || [];
      idList.push({id});
      localStorage.setItem('idNo', JSON.stringify(idList))
    
      const ratings = JSON.parse(localStorage.getItem('rating')) || [];
      const rating = {'id': id,'rating':[0]};
      
      ratings.push({rating});
      localStorage.setItem('rating', JSON.stringify(ratings));
      console.log("Set rating", JSON.parse(localStorage.getItem('rating')));
    
    
  };

  const validateTitle = (blur) =>{
    
    const minLength = 4;
    const maxLength = 128;

    if( formData.value.title.length < minLength){
        if (blur) error.value.title = "Please set a longer title";
    } else if (formData.value.title.length > maxLength){
        if(blur) error.value.title = "Please set a shorter title";
    } else{
        error.value.title = null
    }

  }

  const validateContent = (blur) =>{
    
    const minLength = 20;


    if( formData.value.content.length < minLength){
        if (blur) error.value.content = "Please write a longer post";
    } else{
        error.value.content = null
    }

  }
  </script>
<style>
</style>