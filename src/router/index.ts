import { createRouter, createWebHistory} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Cookies from 'js-cookie'
import Login from '@/components/Login.vue'
import AccessDenied from '@/components/AccessDenied.vue'
import ErrorPage from '@/components/ErrorPage.vue'
import SecretaryHome from '@/components/Secretaries/SecretaryHome.vue'
import ManageUsers from '@/components/Secretaries/ManageUsers.vue'
import SecretaryPlanning from '@/components/Secretaries/SecretaryPlanning.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: AccessDenied,
  },
  {
    path: '/:catchAll(.*)',
    name: 'catchAll',
    component: ErrorPage,
    props: {
      errorTitle: '404 Page Not Found',
      errorMessage: 'The page you are looking for does not exist.',
    },
  },
  {
    path: '/SHome',
    name: 'SecretaryHome',
    component: SecretaryHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/SPlanning',
    name: 'SecretaryPlanning',
    component: SecretaryPlanning,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'ManageUsers',
    component: ManageUsers,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  const isAuthenticated = token !== undefined

  let userRole: number | null = null
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    userRole = payload.userRole
  }

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (userRole !== null) {
    if (to.matched.some(record => record.meta.requiresManager) && userRole !== 1) {
      next({ name: 'PagePourLesAutresRoles' })
      return
    }
    if (to.matched.some(record => record.meta.requiresSecretary) && userRole !== 2) {
      next({ name: 'PagePourLesAutresRoles' })
      return
    }
    if (to.matched.some(record => record.meta.requiresNurse) && userRole !== 3) {
      next({ name: 'PagePourLesAutresRoles' })
      return
    }
  }

  next()
})

export default router
