import { useEffect } from 'react'
import './App.css'
import { RouterProvider, createHashRouter } from "react-router-dom"

import Home from "./pages/Home"
import Login from "./pages/Login"
import HomeAdmin from "./pages/HomeAdmin"

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
