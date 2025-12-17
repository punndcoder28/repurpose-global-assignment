<script setup lang="ts">
import type { PostType } from '../../types/post'
import { formatRelativeTime } from '../../utils/dateFormatter'
import { computed } from 'vue'

const props = defineProps<{
  post: PostType
}>()

const contentPreview = computed(() => {
  const maxLength = 150
  if (props.post.content.length <= maxLength) {
    return props.post.content
  }
  return props.post.content.substring(0, maxLength) + '...'
})

const formattedDate = computed(() => formatRelativeTime(props.post.createdAt))
</script>

<template>
  <div class="post-card">
    <h3 class="post-title">{{ post.title }}</h3>
    <p class="post-content">{{ contentPreview }}</p>
    <div class="post-meta">
      <span class="post-author">{{ post.author.email }}</span>
      <span class="post-date">{{ formattedDate }}</span>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary);
}

.post-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.4;
}

.post-content {
  margin: 0 0 1rem 0;
  color: var(--color-text);
  line-height: 1.6;
  font-size: 0.95rem;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
}

.post-author {
  color: var(--color-primary);
  font-weight: 500;
}

.post-date {
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .post-card {
    padding: 1.25rem;
  }

  .post-title {
    font-size: 1.1rem;
  }

  .post-content {
    font-size: 0.9rem;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
