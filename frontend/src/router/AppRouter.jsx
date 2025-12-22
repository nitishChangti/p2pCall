import { createBrowserRouter,RouterProvider } from "react-router-dom";
import App from "../App";
import Home from '../pages/Home'
import Login from "../pages/Login";
import Register from "../pages/Register";
import  {AuthPageLayout,AuthLayout,CallPage} from '../components/index'
import NewCall from "../pages/NewCall";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        // path: "/",
        index: true,
        element: <Home />
      },
      {
        path: "login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        )
          
      },
      {
        path: "signup",
        element: (
          <AuthLayout authentication={false}>
            <Register />
          </AuthLayout>
        )
      },
      {
        element: (
          <AuthLayout authentication={true}>
            <AuthPageLayout/>
          </AuthLayout>
        ),
        children: [
          {
            path: "video-request",
            element: <NewCall />
          },
        ]
      },
      {
        path: "call/:userId",     // ✅ NEW ROUTE
        element:(
          <AuthLayout authentication={true}>
            <CallPage />
          </AuthLayout>
        ) 
      }
    ]
  }
]);


export default function AppRouter(){
    return(
        <RouterProvider router={router}/>
    )
}