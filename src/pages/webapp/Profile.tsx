import {UsersHttpService} from "@/services/users-http-service.ts";
import {useEffect, useState} from "react";
import {User} from "@/model/User.ts";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";

const usersHttpService = new UsersHttpService();

export default function Profile() {
    const [user, setUser] = useState<User>();

    useEffect(() => {
        usersHttpService.getUser().then(setUser);
    }, []);

    if (!user) return null;

    return (
        <>
            <h1 className={"text-4xl font-bold"}>Profile</h1>
            <div className={"flex flex-row mt-5 gap-5"}>
                <Card className={"shadow-none flex-1"}>
                    <CardHeader>
                        <CardTitle className={"pb-3"}>Personal information</CardTitle>
                        <CardDescription>
                            <Input type="email" disabled={true} value={user.email}/>
                            <div className={"flex flex-row gap-4 mt-4"}>
                                <Input type="firstName" disabled={true} value={user.firstName}/>
                                <Input type="lastName" disabled={true} value={user.lastName}/>
                            </div>
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card className={"shadow-none flex-1"}>
                    <CardHeader>
                        <CardTitle className={"pb-3"}>Risk profile</CardTitle>
                        <CardDescription>
                            <ToggleGroup
                                size="lg"
                                type="single"
                                variant="outline" value={user.riskLevel.toString()}
                                onValueChange={newValue => {
                                    if (newValue) {
                                        setUser(user => ({...user, riskLevel: parseInt(newValue)} as User))
                                    }
                                }}
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
                            <Badge className={"mt-2"} variant="secondary">
                                {user.riskLevel === 1 && "Conservative"}
                                {user.riskLevel === 2 && "Moderate"}
                                {user.riskLevel === 3 && "Aggressive"}
                                {user.riskLevel === 4 && "Very aggressive"}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
            <hr className={"my-5"}/>
            <Button className={"block cursor-pointer"}
                    onClick={() => usersHttpService.updateUser(user).then(() => {
                        usersHttpService.getUser().then(setUser)
                    })}>
                Save
            </Button>
        </>
    )
}