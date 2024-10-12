<template>
  <div class="container my-4">
    <h1 class="text-center">Admin Dashboard</h1>

    <div class="mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Search users..."
        v-model="searchQuery"
      />
    </div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th @click="sortBy('username')">
            Username
            <span v-if="sortKey === 'username'" :class="sortOrder === 'asc' ? 'text-primary' : 'text-muted'">▲</span>
          </th>
          <th @click="sortBy('role')">
            Role
            <span v-if="sortKey === 'role'" :class="sortOrder === 'asc' ? 'text-primary' : 'text-muted'">▲</span>
          </th>
          <th @click="sortBy('email')">
            Email
            <span v-if="sortKey === 'email'" :class="sortOrder === 'asc' ? 'text-primary' : 'text-muted'">▲</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.email }}</td>
        </tr>
      </tbody>
    </table>

    <div class="mt-3">
      <strong>Total Users: {{ totalUsers }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();
const users = ref([]);
const searchQuery = ref('');
const sortKey = ref('username');
const sortOrder = ref('asc');

const fetchUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const userDocs = await getDocs(usersCollection);
    users.value = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const filtered = users.value.filter(user =>
    user.username.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );

  return filtered.sort((a, b) => {
    const modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });
});

const totalUsers = computed(() => filteredUsers.value.length);

const sortBy = (key) => {
  sortOrder.value = (sortKey.value === key && sortOrder.value === 'asc') ? 'desc' : 'asc';
  sortKey.value = key;
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.table th {
  cursor: pointer;
}
</style>
