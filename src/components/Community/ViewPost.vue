<template>
  <div class="container mt-4">
    <div class="card">
      <div class="card-header">
        <h3>{{ post.title }}</h3>
      </div>
      <div class="card-body">
        <h5 class="card-title">Author: {{ post.currentuser }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">Role: {{ userRole }}</h6>
        <h6 class="card-subtitle mb-2 text-muted">Post Number: {{ postNumber }}</h6>
        <p class="card-text">{{ post.content }}</p>
        <div>
          <div v-if="!hasRatedthePost.post" class="mb-3">
            <star-rating
              @update:rating="setRating"
              :increment="0.5"
              star-size="24"
              v-model="ratingValue"
            />
          </div>

          <div v-else class="text-danger">
            {{ hasRatedthePost.display }}
          </div>
        </div>
        <router-link to="/forum" class="btn btn-primary">Back to Forum</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import StarRating from 'vue-star-rating';

const db = getFirestore();
const route = useRoute();
const post = ref({});
const userRole = ref(null);
const postNumber = ref(null);

const hasRatedthePost = ref({
  post: false,
  display: ' ',
});

const ratingValue = ref(0);

const getRole = async (username) => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      userRole.value = userData.role;
    } else {
      userRole.value = 'Unknown';
    }
  } catch (err) {
    console.error('Error fetching user role:', err);
  }
};

onMounted(async () => {
  const postID = route.params.id;
  try {
    const postDoc = await getDoc(doc(db, 'posts', postID));
    if (postDoc.exists()) {
      post.value = postDoc.data();
      postNumber.value = postDoc.data().postNumber;
      await getRole(post.value.currentuser);
      checkRating();
    } else {
      console.log('No such post found');
    }
  } catch (err) {
    console.error('Error fetching post:', err);
  }
});

const checkRating = async () => {
  const postID = route.params.id;
  const currUser = localStorage.getItem('currentUser');
  if (currUser) {
    try {
      const q = query(collection(db, 'userRatings'), where('username', '==', currUser));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userRating = querySnapshot.docs[0].data();
        if (userRating.posts.includes(postID)) {
          hasRatedthePost.value.post = true;
          hasRatedthePost.value.display = 'The user has already rated this post';
        }
      }
    } catch (err) {
      console.error('Error fetching user rating:', err);
    }
  }
};

const setRating = async (ratingValue) => {
  const currUser = localStorage.getItem('currentUser');
  const postID = route.params.id;

  try {
    const ratingDoc = await getDoc(doc(db, 'ratings', postID));
    if (ratingDoc.exists()) {
      await updateDoc(doc(db, 'ratings', postID), {
        rating: arrayUnion(ratingValue),
      });
    } else {
      await setDoc(doc(db, 'ratings', postID), {
        rating: [ratingValue],
      });
    }

    const q = query(collection(db, 'userRatings'), where('username', '==', currUser));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userRatingDoc = querySnapshot.docs[0].id;
      await updateDoc(doc(db, 'userRatings', userRatingDoc), {
        posts: arrayUnion(postID),
      });
    } else {
      await setDoc(doc(db, 'userRatings', currUser), {
        username: currUser,
        posts: [postID],
      });
    }

    hasRatedthePost.value.post = true;
    hasRatedthePost.value.display = 'The user has already rated this post';
  } catch (err) {
    console.error('Error setting rating:', err);
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.card-body {
  padding: 20px;
}
</style>
