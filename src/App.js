import React from "react";
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";

import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloProvider } from "@apollo/client";
import Todo from "./Todo";

const httpLink = new HttpLink({
  uri: `http://localhost:4000/graphql`,
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: { reconnect: true },
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
function App() {
  return (
    <ApolloProvider client={client}>
      <Todo />
    </ApolloProvider>
  );
}

export default App;
