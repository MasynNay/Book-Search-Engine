const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;
const { authMiddleware } = require("./utils/auth");

const server = new ApolloServer({ // added
  typeDefs,
  resolvers,
  context: authMiddleware
})

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => { //added
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const startApolloServer = async () => { //added
  await server.start() //added
  server.applyMiddleware({ app }) //adde

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(
      `🏃‍♂️ Server Running At: http://localhost:${PORT}${server.graphqlPath}`
    );
  });
});
}
