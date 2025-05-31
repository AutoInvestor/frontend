import {createBrowserRouter} from "react-router-dom";
import Landing from "@/pages/Landing.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Dashboard from "@/pages/webapp/Dashboard.tsx";
import {RequireAuth} from "@/components/RequireAuth.tsx";
import Profile from "@/pages/webapp/Profile.tsx";

const router = createBrowserRouter([
    {path: "/", element: <Landing/>},
    {path: "/dashboard", element: <RequireAuth>*/<Dashboard/></RequireAuth>},
    {path: "/profile", element: <RequireAuth>*/<Profile/></RequireAuth>},
    {path: "*", element: <NotFound/>},
]);

export default router;
