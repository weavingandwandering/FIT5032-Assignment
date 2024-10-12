<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <form @submit.prevent="submitPost" class="p-4 border rounded" aria-labelledby="formHeader">
            <div class="card-header" id="formHeader">
              <h2>Create your New Post</h2>
            </div>
            <div class="card-body" :style="{ fontSize: textSize }">
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
                  aria-required="true"
                  aria-invalid="error.title !== null"
                />
                <div v-if="error.title" class="text-danger" role="alert">{{ error.title }}</div>
              </div>
              <div class="mb-3">
                <label for="content" class="form-label">Content:</label>
                <textarea
                  class="form-control"
                  id="content"
                  rows="10" 
                  placeholder="Type your post content here"
                  @blur="() => validateContent(true)"
                  @input="() => validateContent(false)"
                  v-model="formData.content"
                  aria-required="true"
                  aria-invalid="error.content !== null"
                ></textarea>
                <div v-if="error.content" class="text-danger" role="alert">{{ error.content }}</div>
              </div>
              <button type="submit" class="btn btn-success w-100">Submit Post</button>
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
import { getFirestore, collection, addDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore';

const router = useRouter();
const db = getFirestore();

const formData = ref({
  title: '',
  content: '',
});

const error = ref({
  title: null,
  content: null,
});

const textSize = ref('1rem');

const submitPost = async () => {
  validateContent();
  validateTitle();

  if (error.value.title == null && error.value.content == null) {
    try {
      const postNumber = await getNextPostNumber();
      await savePost(formData.value.title, formData.value.content, localStorage.getItem('currentUser'), postNumber);
      router.push('/forum');
    } catch (err) {
      console.error('Error saving post:', err);
    }
  }
};

const getNextPostNumber = async () => {
  const counterRef = doc(db, 'metadata', 'postCounter');
  let postNumber;

  try {
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (!counterDoc.exists()) {
        throw 'Counter document does not exist!';
      }

      const currentNumber = counterDoc.data().nextPostNumber;
      postNumber = currentNumber;

      transaction.update(counterRef, { nextPostNumber: currentNumber + 1 });
    });

    return postNumber;
  } catch (err) {
    console.error('Transaction failed: ', err);
    throw err;
  }
};

const savePost = async (title, content, currentuser, postNumber) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      postNumber,
      title,
      content,
      currentuser,
      timestamp: serverTimestamp(),
      rating: [0],
    });
    console.log('Post saved with ID:', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

const validateTitle = (blur) => {
  const minLength = 4;
  const maxLength = 128;

  if (formData.value.title.length < minLength) {
    if (blur) error.value.title = 'Please set a longer title';
  } else if (formData.value.title.length > maxLength) {
    if (blur) error.value.title = 'Please set a shorter title';
  } else {
    error.value.title = null;
  }
};

const validateContent = (blur) => {
  const minLength = 20;

  if (formData.value.content.length < minLength) {
    if (blur) error.value.content = 'Please write a longer post';
  } else {
    error.value.content = null;
  }
};
</script>

<style scoped>
.card {
  border: 2px solid #007bff;
}

.card-header {
  background-color: #007bff;
  color: white;
}

.btn-success {
  background-color: #4caf50;
  border-color: #4caf50;
}

.text-danger {
  color: #d9534f; 
}

.text-danger[role="alert"] {
  background-color: rgba(217, 83, 79, 0.1);
}
</style>
