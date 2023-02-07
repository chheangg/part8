import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context';

// setContext is used to change the header of the request sent to the server

/// This will use setContext to modify the request header
const authLink = setContext((_, { headers }) => {
  // Fetch token directly from localstorage for server authentication
  const token = localStorage.getItem('library-user-token');
  return {
    ...headers,
    authorization: token ? `Bearer ${token}` : null
  }
})

const httpLink = new HttpLink({
  uri: 'http://localhost:4000' 
})

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
})

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
