import './App.css'



import {
  Routes,
  Route,
} from "react-router-dom"

import { Show, RedirectToSignIn } from "@clerk/react"

import Events from "./pages/events"
import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home"
import Profile from "./pages/Profile"


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
              <Dashboard 
              

              
              
              />
            </Show>
            <Show when="signed-out">
              <Home />
            </Show>
          </>
        }
      />
      <Route path="/createevent" 
      element={
       <>
       
       <Show when="signed-in">
        <Events />
       </Show>
       <Show when="signed-out">
        <RedirectToSignIn />
       </Show>
       </>


      }/>

      <Route path="/profile" 
      element={
       <>
       <Show when="signed-in">
        <Profile />
       </Show>
       <Show when="signed-out">
        <RedirectToSignIn />
       </Show>
       </>
      }/>

    </Routes>

  )
}

export default App