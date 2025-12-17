import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apolloClient } from '../main'
import gql from 'graphql-tag'
import type { PostType, CreatePostInput, CreatePostResponse } from '../types/post'

const POSTS_QUERY = gql`
  query Posts {
    posts {
      id
      title
      content
      author {
        id
        email
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      author {
        id
        email
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<PostType[]>([])
  const isLoading = ref<boolean>(false)
  const isCreating = ref<boolean>(false)
  const error = ref<string | null>(null)

  const hasPosts = computed(() => posts.value.length > 0)

  async function fetchPosts(): Promise<void> {
    isLoading.value = true
    error.value = null

    console.log('fetchPosts', POSTS_QUERY)

    try {
      const result = await apolloClient.query<{ posts: PostType[] }>({
        query: POSTS_QUERY,
        fetchPolicy: 'network-only'
      })

      if (result.data?.posts) {
        posts.value = result.data.posts
      }
    } catch (err: any) {
      console.log(err)
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Failed to fetch posts'
      error.value = errorMessage
      console.error('Error fetching posts:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createPost(title: string, content: string): Promise<PostType> {
    isCreating.value = true
    error.value = null

    try {
      const result = await apolloClient.mutate<CreatePostResponse, { input: CreatePostInput }>({
        mutation: CREATE_POST_MUTATION,
        variables: {
          input: { title, content }
        }
      })

      if (!result.data?.createPost) {
        throw new Error('Failed to create post')
      }

      const newPost = result.data.createPost

      // Add the new post to the beginning of the array for immediate feedback
      posts.value = [newPost, ...posts.value]

      return newPost
    } catch (err: any) {
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Failed to create post'
      error.value = errorMessage
      console.error('Error creating post:', err)
      throw new Error(errorMessage)
    } finally {
      isCreating.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    posts,
    isLoading,
    isCreating,
    error,
    hasPosts,
    fetchPosts,
    createPost,
    clearError
  }
})
