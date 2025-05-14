import {Link, Outlet, useLocation} from "react-router-dom";
import {UsersHttpService} from "@/services/users-http-service.ts";
import {useEffect, useState} from "react";
import {User} from "@/model/User.ts";

const userHttpService = new UsersHttpService();

function WebAppLayout() {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        userHttpService.getUser().then(setUser);
    }, []);

    const elements = [
        { name: "Overview", path: "/dashboard" },
        { name: "News", path: "/news" },
        { name: "Alerts", path: "/alerts" },
        { name: "Simulation", path: "/simulation" },
    ];

    const location = useLocation();
    return (
        <>
            <div className={"w-[80%] max-w-[1200px] min-w-[200px] mx-auto"}>
                <h1 className={"text-4xl font-bold py-6 mt-6"}>Dashboard</h1>
                {user && <p>Hello {user.userId}!</p>}
                <nav className={"border-b-1"}>
                    <ul className={"flex flex-row"}>
                        {elements.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.name}><Link className={`inline-block py-2 px-3 ${isActive ? "text-black" : "text-neutral-500 hover:text-black"}`} to={item.path}>{item.name}</Link></li>
                            )
                        })}
                    </ul>
                </nav>
                <Outlet></Outlet>
            </div>
        </>
    )
}

export default WebAppLayout;