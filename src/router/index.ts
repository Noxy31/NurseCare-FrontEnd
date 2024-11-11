import { createRouter, createWebHistory} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Cookies from 'js-cookie'
import Login from '@/components/Login.vue'
import AccessDenied from '@/components/AccessDenied.vue'
import ErrorPage from '@/components/ErrorPage.vue'

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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  const isAuthenticated = token !== undefined

  let isAdmin = false
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    isAdmin = payload.isAdmin
  }

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (isAuthenticated && !isAdmin) {
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (to.path === '/home') {
        next({ name: 'DVHome' })
        return
      }

      next({ name: 'AccessDenied' })
      return
    }
  }

  next()
})

export default router
