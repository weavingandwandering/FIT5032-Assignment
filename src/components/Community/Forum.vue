<template>
  <div class="container mt-4">
    <h3 class="text-center mb-4">Forum</h3>

    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-success" @click="newPost">New Post</button>

      <div class="input-group w-50">
        <select v-model="searchColumn" class="form-select" aria-label="Select column to search">
          <option value="all">All Columns</option>
          <option value="title">Title</option>
          <option value="currentuser">Author</option>
        </select>
        <input
          v-model="globalSearch"
          placeholder="Search"
          class="form-control"
          aria-label="Search posts"
        />
      </div>

      <div class="d-flex align-items-center">
        <label class="mr-2">Sort by:</label>
        <select v-model="sortBy" @change="sortTable" class="form-select" aria-label="Sort posts">
          <option value="title">Title</option>
          <option value="currentuser">Author</option>
          <option value="rating">Rating</option>
          <option value="postNumber">Post No</option>
        </select>
      </div>
    </div>

    <table class="table table-striped table-responsive-md">
      <thead class="thead-light">
        <tr>
          <th scope="col" @click="sortTable('postNumber')">Post No.</th>
          <th scope="col" @click="sortTable('title')">Title</th>
          <th scope="col" @click="sortTable('currentuser')">Author</th>
          <th scope="col" @click="sortTable('role')">Role</th>
          <th scope="col" @click="sortTable('averageRating')">Rating</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(post, index) in paginatedPosts"
          :key="index"
          @click="viewPost(post.id)"
          :style="{
            cursor: 'pointer',
            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff'
          }"
        >
          <td>{{ post.postNumber }}</td>
          <td>{{ post.title }}</td>
          <td>{{ post.currentuser }}</td>
          <td>{{ roles[post.currentuser] || 'Loading...' }}</td>
          <td>
            <strong>Avg:</strong> {{ post.averageRating }}<br />
            <strong>Total Ratings:</strong> {{ post.ratingCount }}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <button class="btn btn-primary" @click="prevPage" :disabled="currentPage === 1">
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button class="btn btn-primary" @click="nextPage" :disabled="currentPage === totalPages">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'

const posts = ref([])
const globalSearch = ref('')
const searchColumn = ref('all')
const sortBy = ref('id') // Set default sorting by 'id'
const currentPage = ref(1)
const rowsPerPage = 10
const roles = ref({})
const db = getFirestore()
const router = useRouter()

const newPost = () => {
  router.push('/newpost')
}

const fetchPosts = async () => {
  const postsCollection = collection(db, 'posts')
  const postsSnapshot = await getDocs(postsCollection)
  const postsData = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  for (const post of postsData) {
    const [average, count] = await getRating(post.id)
    post.averageRating = average
    post.ratingCount = count
  }

  posts.value = postsData
  fetchRoles()
}

const fetchRoles = async () => {
  const uniqueUsers = [...new Set(posts.value.map((post) => post.currentuser))]
  for (const username of uniqueUsers) {
    if (username) {
      roles.value[username] = await getRole(username)
    }
  }
}

const viewPost = (postId) => {
  router.push({ name: 'ViewPost', params: { id: postId } })
}

const filteredPosts = computed(() => {
  let filtered = posts.value

  // Filter based on global search and selected column
  if (globalSearch.value) {
    if (searchColumn.value === 'all') {
      filtered = filtered.filter(
        (post) =>
          (post.title && post.title.toLowerCase().includes(globalSearch.value.toLowerCase())) ||
          (post.currentuser &&
            post.currentuser.toLowerCase().includes(globalSearch.value.toLowerCase()))
      )
    } else if (searchColumn.value === 'title') {
      filtered = filtered.filter(
        (post) => post.title && post.title.toLowerCase().includes(globalSearch.value.toLowerCase())
      )
    } else if (searchColumn.value === 'currentuser') {
      filtered = filtered.filter(
        (post) =>
          post.currentuser &&
          post.currentuser.toLowerCase().includes(globalSearch.value.toLowerCase())
      )
    }
  }

  return filtered
})

// Handle sorting separately
const sortedPosts = computed(() => {
  const sorted = [...filteredPosts.value] // Create a copy for sorting

  if (sortBy.value) {
    if (sortBy.value === 'rating') {
      // You might want to implement a proper rating comparison
      return sorted.sort((a, b) => {
        const ratingA = getRating(a.id)
        const ratingB = getRating(b.id)
        return ratingB[0] - ratingA[0] // Sort by rating in descending order
      })
    } else {
      return sorted.sort((a, b) => (b[sortBy.value] > a[sortBy.value] ? 1 : -1)); // Sort in descending order
    }
  }
  return sorted;
});

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return sortedPosts.value.slice(start, start + rowsPerPage)
})

const totalPages = computed(() => Math.ceil(sortedPosts.value.length / rowsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const getRole = async (usernameFromLocalStorage) => {
  try {
    if (usernameFromLocalStorage) {
      const usersC = collection(db, 'users')
      const q = query(usersC, where('username', '==', usernameFromLocalStorage))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data()
        return userData.role || 'Unknown'
      }
    }
    return 'Unknown'
  } catch (err) {
    return 'Error'
  }
}

const getRating = async (postId) => {
  const ratingRef = collection(db, 'ratings')
  console.log(postId)
  const snapshot = await getDoc(doc(db, 'ratings', postId));  
  console.log(snapshot)
  if (!snapshot.empty) {
    const ratingList = snapshot.data().rating;
    const sum = ratingList.reduce((a, b) => a + b, 0);
    const average = sum / ratingList.length;
    return [average.toFixed(2), ratingList.length];
  }
  return [0, 0];
}

onMounted(() => {
  fetchPosts()
})
</script>


<style scoped>
.table {
  background-color: #fff;
}

.table th {
  background-color: #007bff;
  color: white;
}

.table th:hover {
  background-color: #0056b3;
}

.table td {
  vertical-align: middle;
}
</style>
