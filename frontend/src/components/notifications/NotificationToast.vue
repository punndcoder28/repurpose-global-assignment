<script setup lang="ts">
interface Notification {
  id: number
  author: string
  title: string
  postId: number
}

defineProps<{
  notifications: Notification[]
}>()

const emit = defineEmits<{
  (e: 'dismiss', id: number): void
}>()
</script>

<template>
  <div class="notification-container">
    <TransitionGroup name="toast">
      <div v-for="notification in notifications" :key="notification.id" class="notification-toast">
        <div class="toast-content">
          <span class="toast-icon">📝</span>
          <div class="toast-text">
            <strong>New Post!</strong>
            <p class="toast-author">{{ notification.author }} published:</p>
            <p class="toast-title">"{{ notification.title }}"</p>
          </div>
          <button
            @click="emit('dismiss', notification.id)"
            class="toast-close"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification-toast {
  background: white;
  border-left: 4px solid var(--color-primary);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-text strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--color-heading);
  font-size: 0.95rem;
}

.toast-author {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

.toast-title {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  font-style: italic;
  color: var(--color-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: color 0.2s;
  line-height: 1;
}

.toast-close:hover {
  color: var(--color-heading);
}

.toast-close:active {
  transform: scale(0.95);
}

/* Animations */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .notification-container {
    top: 70px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .toast-content {
    padding: 0.875rem;
  }

  .toast-icon {
    font-size: 1.25rem;
  }

  .toast-text strong {
    font-size: 0.9rem;
  }

  .toast-author,
  .toast-title {
    font-size: 0.85rem;
  }
}
</style>
