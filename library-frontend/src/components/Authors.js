import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, CHANGE_AUTHOR_BIRTHDATE } from "../queries"

import { useState } from "react"

const Authors = (props) => {
  const [ name, setName ] = useState('')
  const [ born, setBorn ] = useState('')

  const result = useQuery(ALL_AUTHORS)
  const [ changeAuthorBirthdate ] = useMutation(CHANGE_AUTHOR_BIRTHDATE, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>...loading</div>
  }

  const authors = result.data.allAuthors

  const onSubmit = (event) => {
    event.preventDefault()
    changeAuthorBirthdate({
      variables: {
        name,
        born: parseInt(born)
      }
    })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={onSubmit}>
        <h2>Set birthyear</h2>
        <label htmlFor='name'>name</label>
        <input onChange={({ target }) => setName(target.value)} id='name' name='name' value={name}></input>
        <br></br>
        <label htmlFor='born'>born</label>
        <input onChange={({ target }) => setBorn(target.value)} id='born' name='born' value={born} type='number'></input>
        <br></br>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default Authors
