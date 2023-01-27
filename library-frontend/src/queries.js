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
      id
      published
      title
    }
  }
`

export const ADD_BOOK = gql`
  mutation addNewBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      author
      genres
      id
      published
      title
    }
  }
`

export const CHANGE_AUTHOR_BIRTHDATE = gql`
  mutation changeAuthorBirthdate(
    $name: String!
    $born: Int!
  ) {
    editAuthor(
      name: $name
      setBornTo: $born
    ) {
      bookCount
      born
      id
      name
    }
  }
`