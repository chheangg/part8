import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommend from './components/Recommend'
import { useQuery } from '@apollo/client'
import { USER_DETAIL, ALL_BOOKS} from './queries'

export const updateCache = (cache, query, addedBook) => {
  cache.updateQuery(query, ({ allBooks }) => {
    const uniqByName = (arrays) => arrays.reduce((previous, current) => previous.find(element => element.id === current.id) ? previous : previous.concat(current), [])
    return {
      allBooks: uniqByName(allBooks.concat(addedBook))
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [genres, setGenres] = useState(['All'])
  const [favoriteGenre, setFavoriteGenre] = useState('')
  const [token, setToken] = useState(null);

  const userResult = useQuery(USER_DETAIL, {
    skip: !token
  })

  const bookResult = useQuery(ALL_BOOKS);

  useEffect(() => {
    if (userResult.data && token) {
      setFavoriteGenre(userResult.data.me.favoriteGenre)
    }
  }, [userResult.data])

  useEffect(() => {
    if (bookResult.data) {
      const fetchedGenres = bookResult.data.allBooks.reduce((prev, curr) => {
        return prev.concat(curr.genres.filter(genre => !prev.includes(genre)))
      }, [])
      const returnedGenres = [...genres, ...fetchedGenres.filter(genre => !genres.includes(genre))]
      console.log(bookResult)
      setGenres(returnedGenres)
    }
  }, [bookResult.data])

  const handleLoginSuccessful = (token) => {
    setToken(token)
    setPage('books')
  }

  const handleLogout = () => {
    setToken('')
    setPage('books')
    localStorage.clear('library-user-token')
  }
  
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { token 
          ? 
          <button onClick={() => setPage('add')}>add book</button>
          : 
          null 
        }
        {
          token
          ?
          <button onClick={() => setPage('recommend')}>recommend</button>
          :
          null
        }
        { token 
          ? 
          <button onClick={handleLogout}>logout</button>
          :
          <button onClick={() => setPage('login')}>login</button> 
        }
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} genres={genres} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} handleLogin={handleLoginSuccessful}/>

      <Recommend favoriteGenre={favoriteGenre} show={page === 'recommend'} />
     
    </div>
  )
}

export default App
