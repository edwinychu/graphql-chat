import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, split } from 'apollo-client-preset'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

const wsLink = new WebSocketLink({
  uri: 'wss://subscriptions.us-west-2.graph.cool/v1/cjfnhpiwr3qbr0151oguw1ec1',
  options: {
    reconnect: true
  }
});

const httpLink = new HttpLink({ uri: 'https://api.graph.cool/simple/v1/cjfnhpiwr3qbr0151oguw1ec1'})

//we have two links so we tell the server when to use which
/**
 * @param {Function} fn returns boolean (if true, forwards request to wsLink, if false, forwards to httpLink)
 * @param {Link} wsLink
 * @param {Link} httpLink
 */
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

// create Apollo client with returned link
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})


// provide client useing AppProvider component
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

registerServiceWorker();
