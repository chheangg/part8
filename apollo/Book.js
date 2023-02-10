exports.typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [
      String!
    ]!
  }
`

exports.resolvers = {
  Book: {
    id: ({ _id }) => _id,
  },
}