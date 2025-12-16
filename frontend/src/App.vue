<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <header v-if="authStore.isAuthenticated">
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <div class="user-info">
        <p>Welcome, {{ authStore.user?.email }}</p>
      </div>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px var(--color-shadow);
  padding: 1rem 0;
}

.logo {
  display: block;
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
}

.user-info {
  text-align: center;
  margin-bottom: 1rem;
}

.user-info p {
  margin: 0;
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9rem;
}

nav {
  width: 100%;
  font-size: 0.95rem;
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1rem;
  color: var(--color-text-light);
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

nav a:hover {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

nav a.router-link-exact-active {
  color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
  font-weight: 600;
}

.logout-button {
  padding: 0.5rem 1.25rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.logout-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .user-info {
    text-align: left;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
