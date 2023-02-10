import { ALL_BOOKS, BOOK_ADDED } from "../queries"
import { useQuery, useSubscription, useApolloClient } from "@apollo/client"
import { useEffect, useState } from "react"
import { updateCache } from "../App"

const Books = ({ show, genres }) => {
  const [genre, setGenre] = useState('')
  const client = useApolloClient()

  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre: genre,
    },
  })

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      updateCache(client.cache, { query: ALL_BOOKS, variables: { genre: '' }}, addedBook)
    }
  })

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>...loading</div>
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map(genre => {
          return genre === 'All' 
                  ? 
                  <button key={genre} onClick={() => setGenre('')}>{genre}</button>
                  : 
                  <button key={genre} onClick={() => setGenre(genre)} >{genre}</button>
        })}
      </div>
    </div>
  )
}

export default Books
