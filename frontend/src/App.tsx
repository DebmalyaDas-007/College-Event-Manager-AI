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
import Onboarding from "./pages/Onboarding"
import AdminOnboarding from "./pages/AdminOnboarding"
import AdminDashboard from "./pages/AdminDashboard"
import AuthCallback from "./pages/AuthCallback"
import EventExplorer from "./pages/EventExplorer"


function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/auth-callback" 
        element={
          <>
            <Show when="signed-in">
              <AuthCallback />
            </Show>
            <Show when="signed-out">
              <RedirectToSignIn />
            </Show>
          </>
        }
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

      <Route path="/onboarding" 
      element={
       <>
       <Show when="signed-in">
        <Onboarding />
       </Show>
       <Show when="signed-out">
        <RedirectToSignIn />
       </Show>
       </>
      }/>

      <Route path="/event" 
      element={
       <>
       <Show when="signed-in">
        <EventExplorer />
       </Show>
       <Show when="signed-out">
        <RedirectToSignIn />
       </Show>
       </>
      }/>

      <Route path="/admin-onboarding" 
      element={
       <>
       <Show when="signed-in">
        <AdminOnboarding />
       </Show>
       <Show when="signed-out">
        <RedirectToSignIn />
       </Show>
       </>
      }/>

      <Route path="/admin-dashboard" 
      element={
       <>
       <Show when="signed-in">
        <AdminDashboard />
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