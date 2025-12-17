<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { usePostsStore } from '../../stores/posts'
import { useAuthStore } from '../../stores/auth'
import PostCard from './PostCard.vue'

const postsStore = usePostsStore()
const authStore = useAuthStore()

onMounted(async () => {
  // Wait for next tick to ensure auth is fully initialized
  await nextTick()

  // Only fetch if authenticated
  if (authStore.isAuthenticated) {
    postsStore.fetchPosts()
  }
})

const handleRetry = () => {
  postsStore.clearError()
  postsStore.fetchPosts()
}
</script>

<template>
  <div class="posts-list-container">
    <!-- Loading State -->
    <div v-if="postsStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading posts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="postsStore.error" class="error-state">
      <p class="error-message">{{ postsStore.error }}</p>
      <button @click="handleRetry" class="retry-button">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!postsStore.hasPosts" class="empty-state">
      <div class="empty-icon">📝</div>
      <h2>No posts to show yet</h2>
      <p>Publish a post to see them appear here!</p>
    </div>

    <!-- Posts Grid -->
    <div v-else class="posts-grid">
      <PostCard v-for="post in postsStore.posts" :key="post.id" :post="post" />
    </div>
  </div>
</template>

<style scoped>
.posts-list-container {
  width: 100%;
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--color-text);
  font-size: 1rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
}

.error-message {
  color: #dc2626;
  font-size: 1rem;
  text-align: center;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h2 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h2 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.95rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
