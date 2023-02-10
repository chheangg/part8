exports.typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    books: [Book!]!
    bookCount: Int
  }
`

exports.resolvers = {
  Author: {
    id: ({ _id }) => _id,
    bookCount: (root, args) => root.books.length
  },
}