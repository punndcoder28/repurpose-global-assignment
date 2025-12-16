import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'


import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3200/graphql',
})

// Cache implementation
const cache = new InMemoryCache({
  resultCaching: false
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(createPinia())
app.use(router)

app.mount('#app')
