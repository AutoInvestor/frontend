import {createBrowserRouter} from "react-router-dom";
import Landing from "@/pages/Landing.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Dashboard from "@/pages/webapp/Dashboard.tsx";
import Alerts from "@/pages/webapp/Alerts.tsx";
import Simulation from "@/pages/webapp/Simulation.tsx";
import News from "@/pages/webapp/News.tsx";
import WebAppLayout from "@/pages/webapp/WebAppLayout.tsx";
import {RequireAuth} from "@/components/RequireAuth.tsx";
import Profile from "@/pages/webapp/Profile.tsx";

const router = createBrowserRouter([
    {path: "/", element: <Landing/>},
    {
        element: (
            <RequireAuth>
                <WebAppLayout/>
            </RequireAuth>
        ),
        children: [
            {path: "/dashboard", element: <Dashboard/>},
            {path: "/news", element: <News/>},
            {path: "/alerts", element: <Alerts/>},
            {path: "/simulation", element: <Simulation/>},
        ],
    },
    {path: "/profile", element: <RequireAuth><Profile/></RequireAuth>},
    {path: "*", element: <NotFound/>},
]);

export default router;
