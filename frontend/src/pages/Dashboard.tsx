import {
  UserButton
} from '@clerk/react';


export default function Dashboard() {
  
  return (
    <div className="dashboard">
      <h1>Welcome to the Dashboard</h1>
      <p>This is a protected route. Only authenticated users can see this.</p>
      <UserButton />
    </div>
  )
}
