<template>
  <div class="container mt-4">
    <h3 class="text-center mb-4">Forum</h3>
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-success" @click="newPost">New Post</button>

      <div class="input-group w-50">
        <input 
          v-model="globalSearch" 
          placeholder="Search all columns" 
          class="form-control" 
        />
      </div>

      <div class="d-flex align-items-center">
        <label class="mr-2">Sort by:</label>
        <select v-model="sortBy" @change="sortTable" class="form-select">
          <option value="title">Title</option>
          <option value="currentuser">Author</option>
          <option value="rating">Rating</option>
          <option value="id">Post No</option>
        </select>
      </div>
    </div>

    <table class="table table-striped table-responsive-md">
      <thead class="thead-light">
        <tr>
          <th scope="col" @click="sortTable('id')">Post No.</th>
          <th scope="col" @click="sortTable('title')">Title</th>
          <th scope="col" @click="sortTable('author')">Author</th>
          <th scope="col" @click="sortTable('role')">Role</th>
          <th scope="col" @click="sortTable('averageRating')">Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(post, index) in paginatedPosts"
          :key="index"
          @click="viewPost(post.id)"
          style="cursor: pointer"
        >
          <td>{{ post.id }}</td>
          <td>{{ post.title }}</td>
          <td>{{ post.currentuser }}</td>
          <td>{{ roles[post.currentuser] || 'Loading...' }}</td>
          <td>{{ getRating(post.id)[0] }}/{{ getRating(post.id)[1] }}</td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <button class="btn btn-primary" @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button class="btn btn-primary" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const posts = ref(JSON.parse(localStorage.getItem('post')) || []);
const globalSearch = ref('');
const sortBy = ref('');
const currentPage = ref(1);
const rowsPerPage = 10;
const roles = ref({});
const db = getFirestore();
const router = useRouter();

const newPost = () => {
  router.push('/newpost');
};

const fetchRoles = async () => {
  const uniqueUsers = [...new Set(posts.value.map(post => post.currentuser))]; // Get unique usernames
  for (const username of uniqueUsers) {
    if (username) {
      roles.value[username] = await getRole(username); // Fetch role for each user
    }
  }
};

const viewPost = (postId) => {
  router.push({ name: 'ViewPost', params: { id: postId } });
};

const filteredPosts = computed(() => {
  let filtered = posts.value;

  if (globalSearch.value) {
    filtered = filtered.filter(post =>
      (post.title && post.title.toLowerCase().includes(globalSearch.value.toLowerCase())) ||
      (post.currentuser && post.currentuser.toLowerCase().includes(globalSearch.value.toLowerCase()))
    );
  }

  if (sortBy.value) {
    if (sortBy.value === "rating") {
      filtered.sort((a, b) => {
        const value1 = getRating(a.id);
        const value2 = getRating(b.id);
        if (value1[0] < value2[0]) return -1;
        if (value1[0] > value2[0]) return 1;
        return 0;
      });
    } else {
      filtered.sort((a, b) => {
        if (a[sortBy.value] < b[sortBy.value]) return -1;
        if (a[sortBy.value] > b[sortBy.value]) return 1;
        return 0;
      });
    } 
  }

  return filtered;
});


const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  return filteredPosts.value.slice(start, start + rowsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / rowsPerPage));

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const getRole = async (usernameFromLocalStorage) => {
  try {
    if (usernameFromLocalStorage) {
      const usersC = collection(db, 'users');
      const q = query(usersC, where('username', '==', usernameFromLocalStorage));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData.role || 'Unknown';
      }
    }
    return 'Unknown';
  } catch (err) {
    return 'Error';
  }
};

const getRating = (id) => {
  const ratings = JSON.parse(localStorage.getItem('rating')) || [];
  const ratingList = ratings.find(rating => rating.id == id);

  if (!ratingList) {
    return [0, 0]; 
  }

  const rating = ratingList.rating;
  let sum = 0;

  for (let i = 0; i < rating.length; i++) {
    sum += rating[i];
  }

  const average = sum / rating.length;
  return [average.toFixed(2), rating.length];
};

onMounted(() => {
  fetchRoles();
});
</script>
