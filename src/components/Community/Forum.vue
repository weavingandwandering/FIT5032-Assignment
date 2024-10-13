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
        <select v-model="sortBy" @change="sortTable(sortBy)" class="form-select" aria-label="Sort posts">
          <option value="title">Title</option>
          <option value="currentuser">Author</option>
          <option value="averageRating">Rating</option>
          <option value="postNumber">Post No</option>
        </select>
        <button @click="toggleSortOrder" class="btn btn-secondary ms-2">
          {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
        </button>
      </div>
    </div>

    <table class="table table-striped table-responsive-md">
      <thead class="thead-light">
        <tr>
          <th scope="col" @click="sortTable('postNumber')">
            Post No. <span>{{ getSortIcon('postNumber') }}</span>
          </th>
          <th scope="col" @click="sortTable('title')">
            Title <span>{{ getSortIcon('title') }}</span>
          </th>
          <th scope="col" @click="sortTable('currentuser')">
            Author <span>{{ getSortIcon('currentuser') }}</span>
          </th>
          <th scope="col" @click="sortTable('role')">
            Role <span>{{ getSortIcon('role') }}</span>
          </th>
          <th scope="col" @click="sortTable('averageRating')">
            Rating <span>{{ getSortIcon('averageRating') }}</span>
          </th>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'

const posts = ref([])
const globalSearch = ref('')
const searchColumn = ref('all')
const sortBy = ref('postNumber')
const sortOrder = ref('desc') 
const currentPage = ref(1)
const rowsPerPage = 10
const roles = ref({})
const db = getFirestore()
const router = useRouter()

const newPost = () => {
  router.push('/newpost')
}

//gets the post from the database 
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
//get the role from the user from the database
const fetchRoles = async () => {
  const uniqueUsers = [...new Set(posts.value.map((post) => post.currentuser))]
  for (const username of uniqueUsers) {
    if (username) {
      console.log(username)
      roles.value[username] = await getRole(username)
    }
  }
}
//redirects when clicked on post 
const viewPost = (postId) => {
  router.push({ name: 'ViewPost', params: { id: postId } })
}

// Toggle between ascending and descending
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const sortTable = (key) => {
  if (sortBy.value === key) {
    toggleSortOrder() // If the same key is clicked again, toggle the order
  } else {
    sortBy.value = key // Change the sorting key
    sortOrder.value = 'asc' // Reset to ascending for a new column
  }
}
//filtering for posts
const filteredPosts = computed(() => {
  let filtered = posts.value

  if (globalSearch.value) {
    filtered = filtered.filter((post) => {
      if (searchColumn.value === 'all') {
        return post.title?.toLowerCase().includes(globalSearch.value.toLowerCase()) || 
               post.currentuser?.toLowerCase().includes(globalSearch.value.toLowerCase())
      }
      return post[searchColumn.value]?.toLowerCase().includes(globalSearch.value.toLowerCase())
    })
  }

  return filtered
})
//sorting posts
const sortedPosts = computed(() => {
  const sorted = [...filteredPosts.value]
  if (sortBy.value) {
    return sorted.sort((a, b) => {
      const valA = a[sortBy.value] || 0
      const valB = b[sortBy.value] || 0
      if (sortOrder.value === 'asc') {
        return valA > valB ? 1 : -1
      } else {
        return valA < valB ? 1 : -1
      }
    })
  }
  return sorted
})
//paging the posts
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

//gettingt the rating to be displayed
const getRating = async (postId) => {
  try {
    const ratingDocRef = doc(db, 'ratings', postId) 
    const snapshot = await getDoc(ratingDocRef)

    if (snapshot.exists()) {
      const ratingData = snapshot.data()
      console.log('Rating data:', ratingData) 

      const ratingList = ratingData.rating || []
      if (ratingList.length > 0) {
        const sum = ratingList.reduce((a, b) => a + b, 0)
        const average = sum / ratingList.length
        return [average.toFixed(2), ratingList.length]
      } else {
        return [0, 0] 
      }
    } else {
      return [0, 0] 
    }
  } catch (error) {
    console.error('Error fetching ratings:', error) 
    return [0, 0] 
  }
}

//getting the role of the user
const getRole = async (usernameFromLocalStorage) => {
  try {
    if (usernameFromLocalStorage) {
      const usersC = collection(db, 'users')
      console.log(usersC)

      const q = query(usersC, where('username', '==', usernameFromLocalStorage))
      console.log(q)

      const querySnapshot = await getDocs(q)
      console.log(querySnapshot)

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data()
        console.log(userData)
        return userData.role || 'Unknown'
      } else {
        console.log('No matching user found')
      }
    } else {
      console.log('usernameFromLocalStorage is null or undefined')
    }
    return 'Unknown'
  } catch (err) {
    console.error(err)
    return 'Error'
  }
}


const getSortIcon = (key) => {
  if (sortBy.value === key) {
    return sortOrder.value === 'asc' ? '▲' : '▼'
  }
  return ''
}

onMounted(() => {
  fetchPosts();
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