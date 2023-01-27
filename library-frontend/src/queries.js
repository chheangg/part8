import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      bookCount
      born
      id
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      author
      genres
      id
      published
      title
    }
  }
`