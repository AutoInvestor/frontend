import {UsersHttpService} from "@/services/users-http-service.ts";
import {useEffect, useState} from "react";
import {User} from "@/model/User.ts";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";
import {ArrowTrendingUpIcon} from "@heroicons/react/16/solid";

const usersHttpService = new UsersHttpService();

export default function Profile() {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        usersHttpService.getUser().then(setUser);
    }, []);

    if (!user) return null;

    return (
        <div className={"w-[80%] max-w-[1200px] min-w-[200px] mx-auto"}>
            <div className={"flex justify-between flex-row mt-6"}>
                <Link className={"block text-xl font-medium text-neutral-600"} to={"/"}>AutoInvestor</Link>
                <Link className={"flex text-lg font-medium items-center"} to={"/dashboard"}>
                    <ArrowTrendingUpIcon className={"size-4"}></ArrowTrendingUpIcon>
                    <span className={"ms-2"}>Dashboard</span>
                </Link>
            </div>
            <h1 className={"text-4xl font-bold py-6 mt-6"}>Profile</h1>
            <h2 className={"text-2xl font-medium py-6"}>Risk profile</h2>
            <ToggleGroup
                size="lg"
                type="single"
                variant="outline" value={user.riskLevel.toString()}
                onValueChange={newValue => setUser(user => ({...user, riskLevel: parseInt(newValue)} as User))}
            >
                {/* TODO: Fetch risk levels from back */}
                {[1, 2, 3, 4].map((riskLevelItem, index) => (
                    <ToggleGroupItem
                        key={index}
                        value={riskLevelItem.toString()}
                        aria-label={`Toggle risk level ${riskLevelItem}`}
                    >
                        {riskLevelItem}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
            <Button className={"block mt-5 cursor-pointer"}
                    onClick={() => usersHttpService.updateUser(user).then(() => {
                        usersHttpService.getUser().then(setUser)
                    })}>
                Run simulation
            </Button>
        </div>
    )
}