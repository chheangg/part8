const Book = require('./models/Book')

exports.typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
`

exports.resolvers = {
  Author: {
    id: ({ _id }) => _id,
    bookCount: async (root) => await Book.find({ author: root.id }).count()
  },
}