import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginPage from '../pages/LoginPage.vue'
import ProjectPickerPage from '../pages/ProjectPickerPage.vue'
import BoardPage from '../pages/BoardPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/projects',
    name: 'Projects',
    component: ProjectPickerPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/board',
    name: 'Board',
    component: BoardPage,
    meta: { requiresAuth: true, requiresProject: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresProject && !authStore.selectedProject) {
    next('/projects')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/projects')
  } else {
    next()
  }
})

export default router
