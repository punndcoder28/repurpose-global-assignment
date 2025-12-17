<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePostsStore } from '../../stores/posts'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'postCreated'): void
}>()

const postsStore = usePostsStore()

const title = ref('')
const content = ref('')
const titleError = ref('')
const contentError = ref('')
const showSuccess = ref(false)

const titleCharCount = computed(() => title.value.length)
const contentCharCount = computed(() => content.value.length)

const isTitleValid = computed(() => {
  return title.value.length >= 1 && title.value.length <= 200
})

const isContentValid = computed(() => {
  return content.value.length >= 1 && content.value.length <= 10000
})

const isFormValid = computed(() => {
  return isTitleValid.value && isContentValid.value
})

const validateTitle = () => {
  if (title.value.length === 0) {
    titleError.value = 'Title is required'
  } else if (title.value.length > 200) {
    titleError.value = 'Title must be 200 characters or less'
  } else {
    titleError.value = ''
  }
}

const validateContent = () => {
  if (content.value.length === 0) {
    contentError.value = 'Content is required'
  } else if (content.value.length > 10000) {
    contentError.value = 'Content must be 10,000 characters or less'
  } else {
    contentError.value = ''
  }
}

const handleClose = () => {
  if (!postsStore.isCreating) {
    emit('close')
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const resetForm = () => {
  title.value = ''
  content.value = ''
  titleError.value = ''
  contentError.value = ''
  showSuccess.value = false
  postsStore.clearError()
}

const handleSubmit = async () => {
  // Validate before submitting
  validateTitle()
  validateContent()

  if (!isFormValid.value) {
    return
  }

  try {
    await postsStore.createPost(title.value, content.value)

    // Show success feedback
    showSuccess.value = true

    // Wait a bit to show success message, then close
    setTimeout(() => {
      resetForm()
      emit('postCreated')
      emit('close')
    }, 1000)
  } catch (error) {
    // Error is already set in the store, just keep the sheet open
    console.error('Failed to create post:', error)
  }
}

const handleCancel = () => {
  resetForm()
  handleClose()
}

// Watch for sheet opening to reset form
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  }
)
</script>

<template>
  <Transition name="sheet">
    <div v-if="isOpen" class="sheet-backdrop" @click="handleBackdropClick">
      <div class="sheet-container">
        <div class="sheet-header">
          <h2>Create New Post</h2>
          <button
            class="close-button"
            @click="handleClose"
            :disabled="postsStore.isCreating"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div class="sheet-content">
          <form @submit.prevent="handleSubmit">
            <!-- Title Input -->
            <div class="form-group">
              <label for="post-title" class="form-label">
                Title
                <span class="char-count" :class="{ 'char-count-error': titleCharCount > 200 }">
                  {{ titleCharCount }}/200
                </span>
              </label>
              <input
                id="post-title"
                v-model="title"
                type="text"
                class="form-input"
                :class="{ 'input-error': titleError }"
                placeholder="Enter post title..."
                @blur="validateTitle"
                :disabled="postsStore.isCreating"
              />
              <p v-if="titleError" class="error-message">{{ titleError }}</p>
            </div>

            <!-- Content Textarea -->
            <div class="form-group">
              <label for="post-content" class="form-label">
                Content
                <span class="char-count" :class="{ 'char-count-error': contentCharCount > 10000 }">
                  {{ contentCharCount }}/10,000
                </span>
              </label>
              <textarea
                id="post-content"
                v-model="content"
                class="form-textarea"
                :class="{ 'input-error': contentError }"
                placeholder="Write your post content..."
                rows="12"
                @blur="validateContent"
                :disabled="postsStore.isCreating"
              ></textarea>
              <p v-if="contentError" class="error-message">{{ contentError }}</p>
            </div>

            <!-- Error Message from Store -->
            <div v-if="postsStore.error" class="form-error">
              {{ postsStore.error }}
            </div>

            <!-- Success Message -->
            <div v-if="showSuccess" class="form-success">Post created successfully! ✓</div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click="handleCancel"
                :disabled="postsStore.isCreating"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!isFormValid || postsStore.isCreating"
              >
                <span v-if="postsStore.isCreating">Publishing...</span>
                <span v-else>Publish Post</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.sheet-container {
  width: 500px;
  max-width: 90vw;
  height: 100vh;
  background-color: var(--color-background);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.sheet-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover:not(:disabled) {
  background-color: var(--color-border);
  color: var(--color-heading);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-heading);
  font-size: 0.95rem;
}

.char-count {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-weight: normal;
}

.char-count-error {
  color: #dc2626;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--color-text);
  background-color: var(--color-background);
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-error {
  border-color: #dc2626;
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

.error-message {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #dc2626;
}

.form-error {
  padding: 0.75rem;
  background-color: #fee;
  border: 1px solid #dc2626;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.form-success {
  padding: 0.75rem;
  background-color: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #065f46;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-border);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-border-hover);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Transition animations */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-enter-active .sheet-container,
.sheet-leave-active .sheet-container {
  transition: transform 0.3s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet-container,
.sheet-leave-to .sheet-container {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .sheet-container {
    width: 100vw;
    max-width: 100vw;
  }

  .sheet-header {
    padding: 1rem;
  }

  .sheet-content {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
