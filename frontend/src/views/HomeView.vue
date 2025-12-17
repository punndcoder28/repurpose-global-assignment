<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import PostsList from '../components/posts/PostsList.vue'
import CreatePostSheet from '../components/posts/CreatePostSheet.vue'
import NotificationToast from '../components/notifications/NotificationToast.vue'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import type { PostType } from '../types/post'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const isSheetOpen = ref(false)

interface Notification {
  id: number
  author: string
  title: string
  postId: number
}

const notifications = ref<Notification[]>([])

// Listen for new post events from the store's polling mechanism
const handleNewPost = (event: Event) => {
  const customEvent = event as CustomEvent<PostType>
  const newPost = customEvent.detail

  console.log('New post event received in HomeView:', newPost.title, 'by', newPost.author.email)

  // Show notification
  const notification: Notification = {
    id: Date.now(),
    author: newPost.author.email,
    title: newPost.title,
    postId: newPost.id
  }

  notifications.value.push(notification)

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismissNotification(notification.id)
  }, 5000)
}

// Start polling when component mounts
onMounted(() => {
  console.log('HomeView mounted, starting polling')
  window.addEventListener('newPost', handleNewPost)

  if (authStore.user?.id) {
    // Start polling every 5 seconds
    postsStore.startPolling(authStore.user.id, 2000)
  } else {
    console.error('Cannot start polling: user ID not available')
  }
})

// Stop polling when component unmounts
onUnmounted(() => {
  console.log('HomeView unmounting, stopping polling')
  window.removeEventListener('newPost', handleNewPost)
  postsStore.stopPolling()
})

const dismissNotification = (id: number) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

const openCreateSheet = () => {
  isSheetOpen.value = true
}

const closeCreateSheet = () => {
  isSheetOpen.value = false
}

const handlePostCreated = () => {
  // Post is already added to the store, just close the sheet
  console.log('Post created successfully!')
}
</script>

<template>
  <main class="home-view">
    <div class="home-header">
      <h1>Blog Posts</h1>
      <p class="home-subtitle">Share your thoughts with the community</p>
    </div>

    <PostsList />

    <!-- Floating Action Button -->
    <button class="fab" @click="openCreateSheet" aria-label="Create new post">
      <span class="fab-icon">+</span>
      <span class="fab-text">New Post</span>
    </button>

    <!-- Create Post Sheet -->
    <CreatePostSheet
      :is-open="isSheetOpen"
      @close="closeCreateSheet"
      @post-created="handlePostCreated"
    />

    <!-- Notification Toasts -->
    <NotificationToast :notifications="notifications" @dismiss="dismissNotification" />
  </main>
</template>

<style scoped>
.home-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.home-header {
  margin-bottom: 2rem;
  text-align: center;
}

.home-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-heading);
}

.home-subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fab:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.5);
}

.fab:active {
  transform: translateY(0) scale(0.98);
}

.fab-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.fab-text {
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }

  .home-header h1 {
    font-size: 2rem;
  }

  .home-subtitle {
    font-size: 1rem;
  }

  .fab {
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 1rem;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    justify-content: center;
  }

  .fab-text {
    display: none;
  }

  .fab-icon {
    font-size: 1.75rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .home-header h1 {
    font-size: 2.25rem;
  }
}
</style>
