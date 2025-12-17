<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isProfileMenuOpen = ref(false)

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

const closeProfileMenu = () => {
  isProfileMenuOpen.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
  closeProfileMenu()
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.profile-dropdown')) {
    closeProfileMenu()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}
</script>

<template>
  <header v-if="authStore.isAuthenticated">
    <div class="header-container">
      <div class="header-left">
        <img alt="Logo" class="logo" src="@/assets/logo.svg" width="40" height="40" />
        <nav class="nav-links">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>

      <div class="header-right">
        <div class="profile-dropdown">
          <button @click="toggleProfileMenu" class="profile-button" aria-label="Profile menu">
            <span class="profile-icon">👤</span>
          </button>

          <Transition name="dropdown">
            <div v-if="isProfileMenuOpen" class="dropdown-menu">
              <div class="dropdown-header">
                <span class="user-email">{{ authStore.user?.email }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="dropdown-item logout-item">
                <span class="logout-icon">🚪</span>
                Logout
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  width: 40px;
  height: 40px;
  display: block;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links a {
  padding: 0.5rem 1rem;
  color: var(--color-text);
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-links a:hover {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-links a.router-link-exact-active {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
}

.profile-dropdown {
  position: relative;
}

.profile-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background-color: var(--color-background);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.25rem;
}

.profile-button:hover {
  border-color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.profile-icon {
  font-size: 1.25rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 220px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  background-color: rgba(59, 130, 246, 0.05);
}

.user-email {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
  word-break: break-word;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.logout-item {
  color: #dc2626;
  font-weight: 500;
}

.logout-item:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

.logout-icon {
  font-size: 1rem;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .header-container {
    padding: 0.75rem 1rem;
  }

  .header-left {
    gap: 1rem;
  }

  .nav-links {
    gap: 0.25rem;
  }

  .nav-links a {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }

  .dropdown-menu {
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .nav-links a span {
    display: none;
  }

  .logo {
    width: 32px;
    height: 32px;
  }
}
</style>
