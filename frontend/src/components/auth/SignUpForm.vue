<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <h2>Sign Up</h2>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        placeholder="Enter your email"
        :disabled="loading"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        placeholder="Enter your password"
        :disabled="loading"
      />
    </div>

    <button type="submit" :disabled="loading" class="submit-button">
      {{ loading ? 'Signing up...' : 'Sign Up' }}
    </button>

    <p class="switch-form">
      Already have an account?
      <a href="#" @click.prevent="$emit('switch-to-signin')">Sign in</a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

defineEmits<{
  'switch-to-signin': []
}>()

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.register(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Failed to sign up. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  width: 420px;
  max-width: calc(100vw - 4rem);
  margin: 0 auto;
  padding: 2.5rem;
  background: var(--color-card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px var(--color-shadow), 0 2px 4px -1px var(--color-shadow);
  border: 1px solid var(--color-border);
}

h2 {
  margin: 0 0 2rem 0;
  text-align: center;
  color: var(--color-heading);
  font-size: 1.75rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
}

input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  color: var(--color-text);
  background-color: var(--color-white);
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input:disabled {
  background-color: var(--color-background-soft);
  cursor: not-allowed;
  opacity: 0.6;
}

.submit-button {
  width: 100%;
  padding: 0.875rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--color-error-bg);
  color: var(--color-error);
  border-radius: 8px;
  font-size: 0.875rem;
  border-left: 4px solid var(--color-error);
}

.switch-form {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.switch-form a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.switch-form a:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}
</style>
