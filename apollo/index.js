const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { merge } = require('lodash')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer} = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')  
require('dotenv').config()
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

mongoose.set('strictQuery', false)

console.log('connecting to MongoDB')

mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => console.log('Connected!'))
  .catch((err) => console.log('Failed to connect to MongoDB:', err.message))

const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')

// Schema
const { typeDefs: TokenSchema } = require('./Token')
const { typeDefs: UserSchema, resolvers: userResolver } = require('./User')
const { typeDefs: BookSchema, resolvers: bookResolver } = require('./Book')
const { typeDefs: AuthorSchema, resolvers: authorResolver } = require('./Author')

const { GraphQLError } = require('graphql')

const queries = `
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }

  ${UserSchema}
  ${BookSchema}
  ${AuthorSchema}
  ${TokenSchema}
`

const resolvers = {
  Query: {
    bookCount: async () => {
      console.log(Book)
      return await Book.collection.countDocuments()
    },
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.genre && !args.author) {
        return await Book.find({}).populate('author')
      }

      if (args.genre && args.author) {
        const authorID = await Author.findOne({ name: args.author })._id
        return await Book.find({
          genres: args.genre,
          author: authorID
        }).populate('author')
      }
      
      if (args.genre) {
        return await Book.find({
          genres: args.genre
        }).populate('author')
      }

      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        return await Book.find({
          author: author._id
        }).populate('author')
      }
    },
    allAuthors: async () => await Author.find({}),
    me: async (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })
  
      if (!author) {
        author = new Author({ name: args.author })
      }

      const book = new Book({
        title: args.title,
        author: author,
        published: args.published,
        genres: args.genres,
      })

      try {
        await author.save()
        await book.save()
      } catch(error) {
        throw new GraphQLError('Error adding new book', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          }
        })
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book;
    },
    editAuthor: async (root, args) => {
      const authorName = args.name
      const authorBOD = args.setBornTo
      const author = await Author.findOne({ name: authorName })
      author.born = authorBOD;
      try {
        await author.save()
      } catch(error) {
        throw new GraphQLError('Error editing author', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          }
        })
      }
      return author;
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })
      try {
        await user.save()
      } catch(error) {
        throw new GraphQLError('Error creating user', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          }
        })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user && args.password !== 'password') {
        throw new GraphQLError('Wrong credential', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }
      const token = jwt.sign(userForToken, process.env.JWT_SECRET)
      return { value: token }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)
  const wsServer = new WebSocketServer({
    path: '/',
    server: httpServer
  })
  
  const schema = makeExecutableSchema({
    typeDefs: queries,
    resolvers: merge(resolvers, userResolver, bookResolver, authorResolver),
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async dipose() {
              serverCleanup.dispose()
            }
          }
        }
      }
    ]
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({req, res}) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(
            auth.substring(7), process.env.JWT_SECRET
          )
          const currentUser = await User
            .findById(decodedToken.id)
          return { currentUser }
        }
      }
    }
    )
  )

  const PORT = 4000

  httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`)
  })
}

start()
