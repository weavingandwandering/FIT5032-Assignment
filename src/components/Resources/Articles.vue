<template>
  <div class="container my-5">
      <h2 class="text-center">Populate Events</h2>
      <button @click="populateEvents" class="btn btn-primary">Populate Events</button>
      <div v-if="message" class="mt-3 alert alert-info">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore();
const message = ref('');

const sampleEvents = [
  {
      name: 'Community Clean-Up',
      eventDate: new Date('2024-10-15').getTime(),
      startTime: '09:00',
      endTime: '12:00',
      duration: '3 hours',
      location: 'Royal Botanic Gardens, Melbourne, Victoria',
      organizer: 'Local Environmental Group',
      description: 'Join us for a community clean-up day at the Royal Botanic Gardens.',
      attendees: [
          { name: 'Alice', email: 'alice@example.com' },
          { name: 'Bob', email: 'bob@example.com' }
      ]
  },
  {
      name: 'Charity Fundraiser',
      eventDate: new Date('2024-10-22').getTime(),
      startTime: '18:00',
      endTime: '21:00',
      duration: '3 hours',
      location: 'Melbourne Town Hall, Victoria',
      organizer: 'Charity Organization',
      description: 'A fundraising event to support local charities.',
      attendees: [
          { name: 'Charlie', email: 'charlie@example.com' },
          { name: 'David', email: 'david@example.com' }
      ]
  },
  {
      name: 'Tech Workshop',
      eventDate: new Date('2024-10-29').getTime(),
      startTime: '14:00',
      endTime: '17:00',
      duration: '3 hours',
      location: 'Tech Hub, Melbourne, Victoria',
      organizer: 'Tech Academy',
      description: 'A workshop on the latest technology trends and skills.',
      attendees: [
          { name: 'Eve', email: 'eve@example.com' },
          { name: 'Frank', email: 'frank@example.com' }
      ]
  },
  {
      name: 'Art Exhibition',
      eventDate: new Date('2024-11-05').getTime(),
      startTime: '10:00',
      endTime: '17:00',
      duration: '7 hours',
      location: 'National Gallery of Victoria, Melbourne',
      organizer: 'Art Society',
      description: 'Explore the latest works from local artists at the National Gallery.',
      attendees: [
          { name: 'Grace', email: 'grace@example.com' },
          { name: 'Henry', email: 'henry@example.com' }
      ]
  },
  {
      name: 'Music Festival',
      eventDate: new Date('2024-11-12').getTime(),
      startTime: '15:00',
      endTime: '23:00',
      duration: '8 hours',
      location: 'Federation Square, Melbourne, Victoria',
      organizer: 'Music Lovers Club',
      description: 'Join us for a day of music and fun at Federation Square.',
      attendees: [
          { name: 'Ivy', email: 'ivy@example.com' },
          { name: 'Jack', email: 'jack@example.com' }
      ]
  },
  {
      name: 'Cooking Class',
      eventDate: new Date('2024-11-19').getTime(),
      startTime: '18:00',
      endTime: '20:00',
      duration: '2 hours',
      location: 'Melbourne Community Centre',
      organizer: 'Culinary School',
      description: 'Learn to cook delicious meals in this hands-on cooking class.',
      attendees: [
          { name: 'Liam', email: 'liam@example.com' },
          { name: 'Mia', email: 'mia@example.com' }
      ]
  },
  {
      name: 'Yoga Retreat',
      eventDate: new Date('2024-11-26').getTime(),
      startTime: '08:00',
      endTime: '10:00',
      duration: '2 hours',
      location: 'Mornington Peninsula, Victoria',
      organizer: 'Wellness Center',
      description: 'Join us for a relaxing yoga retreat at the beautiful Mornington Peninsula.',
      attendees: [
          { name: 'Noah', email: 'noah@example.com' },
          { name: 'Olivia', email: 'olivia@example.com' }
      ]
  },
  {
      name: 'Book Club Meeting',
      eventDate: new Date('2024-12-03').getTime(),
      startTime: '19:00',
      endTime: '21:00',
      duration: '2 hours',
      location: 'Melbourne Library',
      organizer: 'Book Lovers Society',
      description: 'Discuss this month’s book selection with fellow readers.',
      attendees: [
          { name: 'Paul', email: 'paul@example.com' },
          { name: 'Quinn', email: 'quinn@example.com' }
      ]
  },
  {
      name: 'Film Screening',
      eventDate: new Date('2024-12-10').getTime(),
      startTime: '18:30',
      endTime: '21:30',
      duration: '3 hours',
      location: 'Palace Cinema, Melbourne',
      organizer: 'Film Society',
      description: 'Enjoy a special screening of a classic film at Palace Cinema.',
      attendees: [
          { name: 'Rita', email: 'rita@example.com' },
          { name: 'Sam', email: 'sam@example.com' }
      ]
  },
  {
      name: 'Charity Walk',
      eventDate: new Date('2024-12-17').getTime(),
      startTime: '07:00',
      endTime: '10:00',
      duration: '3 hours',
      location: 'Albert Park Lake, Melbourne',
      organizer: 'Health Foundation',
      description: 'Participate in a charity walk to raise funds for health initiatives.',
      attendees: [
          { name: 'Tom', email: 'tom@example.com' },
          { name: 'Uma', email: 'uma@example.com' }
      ]
  }
];

const populateEvents = async () => {
  try {
      for (const event of sampleEvents) {
          await addDoc(collection(db, 'events'), event);
      }
      message.value = 'Events populated successfully!';
  } catch (error) {
      console.error('Error adding documents: ', error);
      message.value = 'Error populating events';
  }
};

onMounted(() => {
  // Uncomment the line below if you want to automatically populate events when the component mounts
  // populateEvents();
});
</script>

<style scoped>
h2 {
  font-size: 2rem;
  font-weight: bold;
}
</style>
