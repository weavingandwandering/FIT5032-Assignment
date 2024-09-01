import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/HomeView.vue'
import LoginPage from '../components/LoginPage.vue'
import AboutPage from '@/components/AboutPage.vue'
import SignUp from '@/components/SignUp.vue'
import Forum from '@/components/Forum.vue'
import NewPost from '../components/NewPost.vue'
import ViewPost from '@/components/ViewPost.vue'
import ECalendar from '../components/ECalendar.vue'
import VCalendar from '@/components/VCalendar.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
{
    path: '/login',
    name: 'Login',
    component: LoginPage
},
{
    path: '/about',
    name: 'About',
    component: AboutPage
},
{
    path: '/signup',
    name: 'Signup',
    component: SignUp
},
{
  path: '/forum',
  name: 'Forum',
  component: Forum
}, 
{
  path: '/newpost',
  name: 'NewPost', 
  component: NewPost
}, 
{
  path: '/viewpost:id',
  name: 'ViewPost',
  component: ViewPost
}, 
{
  path: '/ecalendar',
  component: ECalendar,
  beforeEnter: (to, from, next) => {
    const currUser = localStorage.getItem('currentUser');
    const currRole = getRole(currUser);
    if (currRole == "Elderly") {
      next();
    } else {
      next('/vcalendar'); 
    }
  }
},
{
  path: '/vcalendar',
  component: VCalendar,
  beforeEnter: (to, from, next) => {
    const currUser = localStorage.getItem('currentUser');
    const currRole = getRole(currUser);
    if (currRole == "Volunteer") {
      next();
    } else {
      next('/ecalendar'); // Redirect to login if not authenticated
    }
  }
},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

const getRole = (username) => {
  console.log("Username",username);
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const findUser = users.find(user => user.username === username);
  
  if (findUser) {
      console.log("FIND:", findUser);
      return findUser.role;
  } else {
      console.log("User not found");
      return null;  // or some default value like 'Guest'
  }
};