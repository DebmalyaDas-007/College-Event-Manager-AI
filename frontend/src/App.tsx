import './App.css'



import {
  Routes,
  Route,
} from "react-router-dom"
import { Show, RedirectToSignIn } from "@clerk/react"

import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"


function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/dashboard"
        element={
          <>
            <Show when="signed-in">
              <Dashboard />
            </Show>
            <Show when="signed-out">
              <Home />
            </Show>
          </>
        }
      />

    </Routes>

  )
}

export default App