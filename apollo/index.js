const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)

console.log('connecting to MongoDB')

mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => console.log('Connected!'))
  .catch((err) => console.log('Failed to connect to MongoDB:', err.message))

const Book = require('./models/Book')
const Author = require('./models/Author')

const { GraphQLError } = require('graphql')

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [
      String!
    ]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
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
  }
`

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genres) { 
        return await Book.find({}).populate('author')
      }
    },
    allAuthors: async () => await Author.find({})
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
    }
  },
  Author: {
    id: async ({ _id }) => _id,
    bookCount: async (root) => await Book.find({ author: root.id }).count()
  },
  Book: {
    id: async ({ _id }) => _id,
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({url}) => console.log(`Server ready at ${url}`))