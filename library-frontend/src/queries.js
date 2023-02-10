import { gql } from "@apollo/client";

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    author {
      name
    }
    genres
    id
    published
    title
  }
`

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
  query findAllBooks($genre: String) {
    allBooks(
      genre: $genre
    ) {
      ...BookDetails
    }
  }

  ${BOOK_DETAILS}
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
      ...BookDetails
    }
  }

  ${BOOK_DETAILS}
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

export const LOGIN = gql`
  mutation login(
    $username: String!,
    $password: String!
    ) {
      login(
        username: $username,
        password: $password
      ) {
        value
      }
    }
`

export const USER_DETAIL = gql`
query {
  me {
    favoriteGenre
  }
}
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`