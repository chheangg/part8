import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommend from './components/Recommend'
import { useQuery } from '@apollo/client'
import { USER_DETAIL } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [favoriteGenre, setFavoriteGenre] = useState('')
  const [token, setToken] = useState(null);

  const userResult = useQuery(USER_DETAIL, {
    skip: !token
  })

  useEffect(() => {
    if (userResult.data && token) {
      setFavoriteGenre(userResult.data.me.favoriteGenre)
    }
  }, [userResult.data])

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

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Login show={page === 'login'} handleLogin={handleLoginSuccessful}/>

      <Recommend favoriteGenre={favoriteGenre} show={page === 'recommend'} />
     
    </div>
  )
}

export default App
