import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'

import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3200/graphql'
})

// Auth link to add JWT token to headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token')
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

// Create the apollo client with auth link
const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
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
