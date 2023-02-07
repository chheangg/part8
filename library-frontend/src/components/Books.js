import { ALL_BOOKS } from "../queries"
import { useQuery } from "@apollo/client"
import { useState } from "react"

const Books = ({ show, genres }) => {
  const [genre, setGenre] = useState('')

  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre: genre,
    },
    fetchPolicy: 'no-cache'
  })

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>...loading</div>
  }

  const books = result.data.allBooks
  console.log(books)

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
