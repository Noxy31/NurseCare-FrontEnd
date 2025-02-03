import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Cookies from 'js-cookie'
import Login from '@/components/Login.vue'
import AccessDenied from '@/components/AccessDenied.vue'
import ErrorPage from '@/components/ErrorPage.vue'

// composants pour secretaires
import SecretaryPlanning from '@/components/Secretaries/SecretaryPlanning.vue'
import ManagePatients from '@/components/Secretaries/ManagePatients.vue'
import SecretaryBill from '@/components/Secretaries/SecretaryBill.vue'

// composants pour infirmiers
import NurseHome from '@/components/Nurses/NurseHome.vue'
import NurseAgenda from '@/components/Nurses/NurseAgenda.vue'
import NursesBills from '@/components/Nurses/NursesBills.vue'

/// composants pour manager
import ManagerHome from '@/components/Manager/ManagerHome.vue'
import ManagerUsers from '@/components/Manager/ManagerUsers.vue'
import ManagerTrainee from '@/components/Manager/ManagerTrainee.vue'
import ManagerAgenda from '@/components/Manager/ManagerAgenda.vue'
import ManagerBills from '@/components/Manager/ManagerBills.vue'

// routes globales //
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

  // Routes pour Secretaires //
  {
    path: '/SPlanning',
    name: 'SecretaryPlanning',
    component: SecretaryPlanning,
    meta: { requiresAuth: true, requiresSecretary: true },
  },
  {
    path: '/patients',
    name: 'ManagePatients',
    component: ManagePatients,
    meta: { requiresAuth: true, requiresSecretary: true },
  },
  {
    path: '/SBills',
    name: 'SecretaryBill',
    component: SecretaryBill,
    meta: { requiresAuth: true, requiresSecretary: true },
  },

  // routes pour infirmiers //
  {
    path: '/NHome',
    name: 'NurseHome',
    component: NurseHome,
    meta: { requiresAuth: true, requiresNurse: true },
  },
  {
    path: '/NAgenda',
    name: 'NurseAgenda',
    component: NurseAgenda,
    meta: { requiresAuth: true, requiresNurse: true },
  },
  {
    path: '/NBills',
    name: 'NursesBills',
    component: NursesBills,
    meta: { requiresAuth: true, requiresNurse: true },
  },


  ///Routes pour Manager
  {
    path: '/MHome',
    name: 'ManagerHome',
    component: ManagerHome,
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/MUsers',
    name: 'ManagerUsers',
    component: ManagerUsers,
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/MTrainee',
    name: 'ManagerTrainee',
    component: ManagerTrainee,
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/MAgenda',
    name: 'ManagerAgenda',
    component: ManagerAgenda,
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/MBills',
    name: 'ManagerBills',
    component: ManagerBills,
    meta: { requiresAuth: true, requiresManager: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  const isAuthenticated = token !== undefined
  let userRole: string | null = null

  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]))
    userRole = payload.role
  }

  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    return next({ name: 'login' })
  }

  if (userRole !== null) {
    if (to.matched.some((record) => record.meta.requiresManager) && userRole !== 'manager') {
      return next({ name: 'AccessDenied' })
    }
    if (to.matched.some((record) => record.meta.requiresSecretary) && userRole !== 'secretary') {
      return next({ name: 'AccessDenied' })
    }
    if (to.matched.some((record) => record.meta.requiresNurse) && userRole !== 'nurse') {
      return next({ name: 'AccessDenied' })
    }
  }

  next()
})

export default router
