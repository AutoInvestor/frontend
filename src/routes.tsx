import {createBrowserRouter} from "react-router-dom";
import Landing from "@/pages/Landing.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import Profile from "@/pages/Profile.tsx";

const router = createBrowserRouter([
    {path: "/", element: <Landing/>},
    {path: "/dashboard", element: <Dashboard/>},
    {path: "/profile", element: <Profile/>},
    {path: "*", element: <NotFound/>},
]);

export default router;
