import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/HomeView.vue'
import LoginPage from '../components/LoginPage.vue'
import AboutPage from '@/components/AboutPage.vue'
import SignUp from '@/components/SignUp.vue'
import Forum from '@/components/Forum.vue'
import NewPost from '@/components/NewPost.vue'
import ViewPost from '@/components/ViewPost.vue'


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
  path: '/viewpost',
  name: 'ViewPost',
  component: ViewPost
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router