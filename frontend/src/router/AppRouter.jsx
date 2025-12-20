import { createBrowserRouter,RouterProvider } from "react-router-dom";
import App from "../App";
import Home from '../pages/Home'
import Login from "../pages/Login";
import Register from "../pages/Register";
import  AuthLayout from '../components/AuthLayout'
import NewCall from "../pages/NewCall";
const router =  createBrowserRouter([ 
  {
    path:'/',
    element:<App/>,
    children:[
      {
        path:'/',
        element:<Home/>
      },
      {
        path:"/login",
        element:<Login/>
      },
      {
        path:'/signup',
        element:<Register/>
      },
      {
  element: <AuthLayout />,
  children: [
    {
      path: "/video-request",
      element: <NewCall />
    }
  ]
}

    ]
  }
])

export default function AppRouter(){
    return(
        <RouterProvider router={router}/>
    )
}