import { createRouter, createWebHistory } from 'vue-router';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import HomeView from '../components/HomeView.vue';
import LoginPage from '../components/LoginPage.vue';
import CreateEvent from '@/components/WhatsOn/CreateEvent.vue';
import AboutPage from '../components/AboutPage.vue';
import SignUp from '../components/SignUp.vue';
import Forum from '../components/Community/Forum.vue';
import NewPost from '../components/Community/NewPost.vue';
import ViewPost from '../components/Community/ViewPost.vue';
import ECalendar from '../components/WhatsOn/ECalendar.vue';
import VCalendar from '../components/WhatsOn/VCalendar.vue';
import Video from '../components/Resources/Video.vue';
import Articles from '../components/Resources/Articles.vue';
import Checklist from '../components/Resources/Checklist.vue';
import Chatbot from '@/components/Community/Chatbot.vue';
import Donation from '../components/GetInvolved/Donation.vue';
import Volunteering from '../components/GetInvolved/Volunteering.vue';
import ViewEvent from '@/components/WhatsOn/ViewEvent.vue';
import Registration from '@/components/WhatsOn/Registration.vue';
import Statistics from '@/components/GetInvolved/Statistics.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignUp,
  },
  {
    path: '/forum',
    name: 'Forum',
    component: Forum,
  },
  {
    path: '/newpost',
    name: 'NewPost',
    component: NewPost,
  },
  {
    path: '/viewpost:id',
    name: 'ViewPost',
    component: ViewPost,
  },
  {
    path: '/ecalendar',
    component: ECalendar,
    name: 'ECalendar',
  },
  {
    path: '/vcalendar',
    name: 'VCalendar',
    component: VCalendar,
  },
  {
    path: '/videos',
    name: 'Video',
    component: Video,
  },
  {
    path: '/articles',
    name: 'Articles',
    component: Articles,
  },
  {
    path: '/health-checklist',
    name: 'Checklist',
    component: Checklist,
  },
  {
    path: '/chatbot',
    name: 'Chatbot',
    component: Chatbot,
  },
  {
    path: '/donation',
    name: 'Donation',
    component: Donation,
  },
  {
    path: '/volunteering',
    name: 'Volunteering',
    component: Volunteering,
  },
  {
    path: '/eventcreate',
    name: 'CreateEvent',
    component: CreateEvent,
    meta: { requiresRole: 'Volunteer' },
  },
  {
    path: '/viewevent:id',
    name: 'ViewEvent',
    component: ViewEvent,
  },
  {
    path: '/registration',
    name: 'Registration',
    component: Registration,
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const user = localStorage.getItem('currentUser');

  if (to.meta.requiresRole) {
    if (!user) {
      next({ name: 'Login' });
    } else {
      const db = getFirestore();
      const usersC = collection(db, 'users');
      const q = query(usersC, where('username', '==', user));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const userRole = userData.role;

        if (userRole === to.meta.requiresRole) {
          next();
        } else {
          next({ name: 'Home' });
        }
      } else {
        next({ name: 'Login' });
      }
    }
  } else {
    next();
  }
});

export default router;
