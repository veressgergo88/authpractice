import { useEffect, useState } from 'react'
import { Signup } from './components/Signup'
import { Login } from './components/Login'
import { Chat } from './components/Chat'
import { jwtDecode } from 'jwt-decode'

function App() {
  const [page, setPage] = useState("signup")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState("")

  const logout = () => {
    localStorage.removeItem("sessionId")
    feLogout()
  }
  
  const feLogout = () => {
    setIsLoggedIn(false)
    setPage("login")
    setLoggedInUser("")
  }
  
  const feLogin = () => {
    setIsLoggedIn(true)
    setPage("chat")
    const existingToken = localStorage.getItem("sessionId")
    if (existingToken)
    setLoggedInUser(jwtDecode(existingToken) as any)?.email
  }

  useEffect(() => {
    const existingToken = localStorage.getItem("sessionId")
    if (existingToken)
      feLogin()
  }, [])
  
  return (
    <>
      <div className="navbar bg-base-300">
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">My app</a>
      </div>
      <div className="flex gap-4">
      <button className="btn" onClick={() => setPage("signup")}>
        Signup
      </button>
      <button className="btn" onClick={() => setPage("login")}>
        Login
      </button>
      {isLoggedIn &&
      (<button className="btn" onClick={logout}>
        Logout
      </button>)}
    </div>
    </div>

    <main>
      {page === "signup" && (<Signup/>)}
      {page === "login" && (<Login feLogin={feLogin} />)}
      {(page === "chat" && isLoggedIn) && (<Chat loggedInUser={loggedInUser}/>)}
    </main>
  </>
  )
}

export default App
