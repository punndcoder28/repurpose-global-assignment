import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'

import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  // Use runtime config from env-config.js, fallback to env var, then localhost
  uri:
    (window as any).ENV?.VITE_API_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3200/graphql'
})

// Error link to handle errors
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.log(locations)
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)

      // Handle unauthorized errors, but NOT for login/register mutations
      const isAuthMutation =
        operation.operationName === 'Login' || operation.operationName === 'Register'
      if (
        (extensions?.code === 'UNAUTHENTICATED' || message.includes('Unauthorized')) &&
        !isAuthMutation
      ) {
        console.error('Authentication error - redirecting to login')
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_user')
        window.location.href = '/auth'
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

// Auth link to add JWT token to headers
const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem('auth_token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// Cache implementation
const cache = new InMemoryCache({
  resultCaching: false
})

// Create the apollo client with HTTP link only (no WebSockets)
const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache
})

// Export apollo client for use in stores
export { apolloClient }

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(createPinia())
app.use(router)

app.mount('#app')
