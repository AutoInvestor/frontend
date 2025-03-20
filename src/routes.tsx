import { createBrowserRouter } from "react-router-dom";
import Landing from "@/pages/Landing.tsx";
import NotFound from "@/pages/NotFound.tsx";

const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "*", element: <NotFound /> }, // 404 page
]);

export default router;
