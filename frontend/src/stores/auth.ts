import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apolloClient } from '../main'
import gql from 'graphql-tag'
import type { UserType, AuthResponse, LoginInput, RegisterInput } from '../types/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        createdAt
        updatedAt
      }
    }
  }
`

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        createdAt
        updatedAt
      }
    }
  }
`

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<UserType | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function initializeAuth(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      token.value = storedToken
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        clearAuth()
      }
    }
  }

  function saveAuth(authResponse: AuthResponse): void {
    token.value = authResponse.token
    user.value = authResponse.user
    localStorage.setItem(TOKEN_KEY, authResponse.token)
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user))
  }

  function clearAuth(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(email: string, password: string): Promise<void> {
    try {
      const result = await apolloClient.mutate<{ login: AuthResponse }, { input: LoginInput }>({
        mutation: LOGIN_MUTATION,
        variables: {
          input: { email, password }
        }
      })

      if (!result.data?.login) {
        throw new Error('Login failed')
      }

      saveAuth(result.data.login)
    } catch (error: any) {
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message || 'Login failed'
      throw new Error(errorMessage)
    }
  }

  async function register(email: string, password: string): Promise<void> {
    try {
      const result = await apolloClient.mutate<
        { register: AuthResponse },
        { input: RegisterInput }
      >({
        mutation: REGISTER_MUTATION,
        variables: {
          input: { email, password }
        }
      })

      if (!result.data?.register) {
        throw new Error('Registration failed')
      }

      saveAuth(result.data.register)
    } catch (error: any) {
      const errorMessage =
        error.graphQLErrors?.[0]?.message || error.message || 'Registration failed'
      throw new Error(errorMessage)
    }
  }

  function logout(): void {
    clearAuth()
  }

  return {
    token,
    user,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    logout
  }
})
