import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {ChevronLeftIcon, PlayIcon, UserIcon} from "@heroicons/react/16/solid";
import {Button} from "@/components/ui/button.tsx";

function WebAppLayout() {
    const navigate = useNavigate();

    const location = useLocation();

    return (
        <div className={"w-[80%] max-w-[1200px] min-w-[200px] mx-auto"}>
            <div className={"flex justify-between flex-row my-6"}>
                <Link className={"flex flex-row items-center gap-2 text-xl font-medium text-neutral-600"} to={"/dashboard"}>
                    {location.pathname !== "/dashboard" && <ChevronLeftIcon className={"size-6"} />}
                    AutoInvestor
                </Link>
                <div className={"flex flex-row gap-4"}>
                    <Button className={"cursor-pointer"} onClick={() => navigate("/simulation")}>
                        <PlayIcon className={"size-4"}></PlayIcon>
                        <span className={"ms-2"}>Simulate</span>
                    </Button>
                    <Link className={"flex text-lg font-medium items-center"} to={"/profile"}>
                        <UserIcon className={"size-4"}></UserIcon>
                        <span className={"ms-2"}>Profile</span>
                    </Link>
                </div>
            </div>
            <Outlet></Outlet>
        </div>
    )
}

export default WebAppLayout;