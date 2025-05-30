import {Link, Outlet, useLocation} from "react-router-dom";
import {UserIcon} from "@heroicons/react/16/solid";

function WebAppLayout() {
    const elements = [
        { name: "Overview", path: "/dashboard" },
        { name: "News", path: "/news" },
        { name: "Alerts", path: "/alerts" },
        { name: "Simulation", path: "/simulation" },
    ];

    const location = useLocation();
    return (
        <div className={"w-[80%] max-w-[1200px] min-w-[200px] mx-auto"}>
            <div className={"flex justify-between flex-row mt-6"}>
                <Link className={"block text-xl font-medium text-neutral-600"} to={"/"}>AutoInvestor</Link>
                <Link className={"flex text-lg font-medium items-center"} to={"/profile"}>
                    <UserIcon className={"size-4"}></UserIcon>
                    <span className={"ms-2"}>Profile</span>
                </Link>
            </div>
            <h1 className={"text-4xl font-bold py-6"}>Dashboard</h1>
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
    )
}

export default WebAppLayout;