import type { UserType } from './auth'

export interface PostType {
  id: number
  title: string
  content: string
  author: UserType
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  title: string
  content: string
}

export interface CreatePostResponse {
  createPost: PostType
}
