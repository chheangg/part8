import { useMutation } from "@apollo/client"
import { LOGIN } from "../queries"
import { useEffect } from "react"

const Login = ({ show, handleLogin }) => {
  const [login, response] = useMutation(LOGIN)

  useEffect(() => {
    if (response.data) {
      const token = response.data.login.value
      handleLogin(token);
      localStorage.setItem('library-user-token', token)
    }
  }, [response.data])

  const handleFormLogin = (event) => {
    event.preventDefault()

    const username = event.target.username.value
    const password = event.target.password.value

    login({
      variables: {
        username,
        password
      }
    })
  }

  if (!show) {
    return null
  }

  return (
    <form onSubmit={ handleFormLogin }>
      <label forhtml='username'>Username</label>
      <input type='text' id='username' name='username'></input>
      <br></br>
      <label forhtml='password'>Password</label>
      <input type='password' id='password' name='password'></input>
      <br></br>
      <button>login</button>
    </form>
  )
}

export default Login