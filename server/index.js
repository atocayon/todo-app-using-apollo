const express = require("express");
const { createServer } = require("http");
const { PubSub } = require("apollo-server");
const { ApolloServer, gql } = require("apollo-server-express");
const pubsub = new PubSub();
const db = {
  todos: [
    { id: 1, todo: "First Todo", dateAdded: "Not sure", priority: "Normal" },
  ],
};

const schema = gql`
  enum Priority {
    Urgent
    Normal
  }

  type Todo {
    id: ID!
    todo: String!
    dateAdded: String!
    priority: Priority!
  }

  type Query {
    todos: [Todo]
    todoById(id: ID!): Todo
  }

  type Mutation {
    insertTodo(
      id: ID!
      todo: String!
      dateAdded: String!
      priority: Priority!
    ): [Todo]
  }

  type Subscription {
    todoInserted: Todo
  }
`;

const resolvers = {
  Query: {
    todos: (parent, args, context, info) => {
      return context.db.todos;
    },

    todoById: (parent, args, context, info) => {
      return context.db.todos.filter((item) => item.id === args.id)[0];
    },
  },
  Mutation: {
    insertTodo: (_, { id, todo, dateAdded, priority }, context, info) => {
      const data = { id, todo, dateAdded, priority };
      console.log(data);
      context.db.todos.push(data);
      pubsub.publish("TODO_INSERTED", { todoInserted: data });
      return context.db.todos;
    },
  },

  Subscription: {
    todoInserted: {
      subscribe: () => pubsub.asyncIterator(["TODO_INSERTED"]),
    },
  },
};

const dbConnection = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db);
    }, 2000);
  });
};

const app = express();

// Server
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,

  context: async () => {
    return { db: await dbConnection() };
  },
});

server.applyMiddleware({ app, path: "/graphql" });

const httpServer = createServer(app);

server.installSubscriptionHandlers(httpServer);
httpServer.listen({ port: 4000 }, () => {
  console.log("Apollo server is listening on PORT 4000");
});
