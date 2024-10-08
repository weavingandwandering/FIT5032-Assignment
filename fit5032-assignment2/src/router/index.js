import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/HomeView.vue'
import LoginPage from '../components/LoginPage.vue'
import AboutPage from '../components/AboutPage.vue'
import SignUp from '../components/SignUp.vue'
import Forum from '../components/Community/Forum.vue'
import NewPost from '../components/Community/NewPost.vue'
import ViewPost from '../components/Community/ViewPost.vue'
import ECalendar from '../components/WhatsOn/ECalendar.vue'
import VCalendar from '../components/WhatsOn/VCalendar.vue'
import Video from '../components/Resources/Video.vue'
import Articles from '../components/Resources/Articles.vue'
import Checklist from '../components/Resources/Checklist.vue'
import Chatbot from '@/components/Community/Chatbot.vue'
import Donation from '../components/GetInvolved/Donation.vue'
import Volunteering from '../components/GetInvolved/Volunteering.vue'
import CreateEvent from '@/components/WhatsOn/CreateEvent.vue'



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
  name: 'ECalendar'
  
},

{
  path: '/vcalendar',
  name: 'VCalendar',
  component: VCalendar

},
{
  path: '/videos',
  name: 'Video',
  component: Video
}, 
{
  path: '/articles',
  name: 'Articles',
  component: Articles
}, 
{
  path: '/health-checklist', 
  name: 'Checklist', 
  component: Checklist
}, 
{
  path: '/chatbot', 
  name: 'Chatbot', 
  component: Chatbot
}, 
{
  path: '/donation', 
  name: 'Donation', 
  component: Donation
}, 
{
  path: '/volunteering', 
  name: 'Volunteering', 
  component: Volunteering
}, 
{
  path: '/eventcreate', 
  name: 'CreateEvent', 
  component: CreateEvent,
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
      return null;  
  }
};