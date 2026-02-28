import { useState } from "react"
import Dashboard from "./pages/dashboard"
import Login from "./pages/login"
import { auth } from "./scripts/Auth"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isLoggedIn())

  return (
    <>
      {
        isAuthenticated ? <Dashboard /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      }
    </>
  )
}