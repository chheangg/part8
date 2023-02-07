import { ALL_BOOKS } from "../queries"
import { useQuery } from "@apollo/client"
import { useState } from "react"

const Books = (props) => {
  const [genre, setGenre] = useState(null)

  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre: ''
    }
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>...loading</div>
  }

  const books = result.data.allBooks

  // Return a list of genres by comparing each book's genre with the initial genre state list.
  const genres = books.reduce((prev, curr) => {
    return prev.concat(curr.genres.filter(genre => !prev.includes(genre)))
  }, [])


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
          {books.filter(book => genre ? book.genres.includes(genre) : true ).map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map(genre => <button key={genre} onClick={() => setGenre(genre)} >{genre}</button>)}
      </div>
    </div>
  )
}

export default Books
