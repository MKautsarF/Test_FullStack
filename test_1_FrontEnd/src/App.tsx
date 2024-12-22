import { useEffect } from 'react'
import './App.css'
import { RouterProvider, createHashRouter } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import HomeAdmin from "./pages/HomeAdmin"
import EmployeeAttendaceLog from './pages/EmployeeAttendaceLog'

const routerData = [
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/homeAdmin",
    element: <HomeAdmin />
  },
  {
    path: "//homeAdmin/AttendanceLog",
    element: <EmployeeAttendaceLog />
  }
];

const router = createHashRouter(
  routerData.map((route) => ({
    ...route,
    element: route.element
  }))
);

function App() {
  useEffect(() => {}, []);

  return (
    
    <>
      <main className="">
      <RouterProvider router={router} />
    </main>
    </>
  )
}

export default App
