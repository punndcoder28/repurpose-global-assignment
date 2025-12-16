<template>
  <div class="auth-container">
    <SignInForm v-if="mode === 'signin'" @switch-to-signup="mode = 'signup'" />
    <SignUpForm v-else @switch-to-signin="mode = 'signin'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SignInForm from '../components/auth/SignInForm.vue'
import SignUpForm from '../components/auth/SignUpForm.vue'

const mode = ref<'signin' | 'signup'>('signin')
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.auth-container > * {
  position: relative;
  z-index: 1;
}
</style>
