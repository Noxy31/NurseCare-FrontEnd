<script setup lang="ts">
import { ref } from 'vue'
import Cookies from 'js-cookie'
import { Menu, X, Calendar, Receipt, Users, UserCog, LogOut, Home } from 'lucide-vue-next'

interface NavItem {
  name: string
  path: string
  icon: string
}

const props = defineProps<{
  navItems: NavItem[]
}>()

const isMenuOpen = ref(false)

const getIcon = (iconName: string) => {
  const icons = {
    Home,
    Calendar,
    Receipt,
    Users,
    UserCog,
  }
  return icons[iconName as keyof typeof icons]
}

const logout = () => {
  Cookies.remove('token')
  window.location.href = '/'
}
</script>

<template>
  <!-- Desktop Navigation -->
  <nav class="hidden sm:flex w-64 bg-white/30 backdrop-blur-md border-r border-white/40 p-6 flex-col">
    <div class="flex items-center gap-4 mb-8">
      <img
        src="@/assets/logo/NurseCare-Logo.png"
        alt="Nurse Care Logo"
        class="h-12 w-auto drop-shadow-md"
      />
      <h1 class="text-xl font-Octarine bg-gradient-to-r from-sky-400 via-sky-500 to-blue-400 text-transparent bg-clip-text">
        Nurse Care
      </h1>
    </div>

    <div class="flex flex-col space-y-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="p-3 text-sky-900 hover:bg-sky-200/70 hover:text-sky-950 rounded-lg transition-all duration-200 flex items-center gap-3"
      >
        <component :is="getIcon(item.icon)" class="h-5 w-5" />
        {{ item.name }}
      </router-link>
    </div>

    <div class="mt-auto pt-6">
      <button
        @click="logout"
        class="w-full p-3 text-rose-700 hover:bg-rose-100/70 hover:text-rose-800 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        <LogOut class="h-5 w-5 group-hover:stroke-rose-800 transition-colors" />
        Logout
      </button>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <div class="sm:hidden">
    <!-- Mobile Header -->
    <header class="bg-white/30 backdrop-blur-md p-4 flex justify-between items-center">
      <button
        @click="isMenuOpen = !isMenuOpen"
        class="p-2 rounded-lg hover:bg-sky-200/70 transition-colors"
      >
        <Menu class="h-6 w-6 text-sky-900" />
      </button>
      <div class="flex items-center gap-2">
        <img src="@/assets/logo/NurseCare-Logo.png" alt="NurseCare" class="h-8 w-auto" />
        <span class="text-lg font-medium text-sky-900">NurseCare</span>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-50"
      @click="isMenuOpen = false"
    >
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div
        class="absolute left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md p-6"
        @click.stop
      >
        <div class="flex justify-between items-center mb-8">
          <div class="text-xl font-medium text-sky-900">Menu</div>
          <button @click="isMenuOpen = false">
            <X class="h-6 w-6 text-sky-900" />
          </button>
        </div>

        <nav class="space-y-2">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="w-full p-3 text-sky-900 hover:bg-sky-200/70 rounded-lg transition-colors flex items-center gap-2"
            @click="isMenuOpen = false"
          >
            <component :is="getIcon(item.icon)" class="h-5 w-5" />
            {{ item.name }}
          </router-link>

          <button
            @click="logout"
            class="w-full mt-8 p-3 text-rose-600 rounded-lg hover:bg-rose-100/50 transition-colors flex items-center gap-2"
          >
            <LogOut class="h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
