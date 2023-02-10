exports.typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
`

exports.resolvers = {
  User: {
    id: ({ _id }) => _id
  }
}