import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";

import {ArrowLeft} from "lucide-react";

import {UsersHttpService} from "@/services/users-http-service";
import {User} from "@/model/User";

const usersService = new UsersHttpService();

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [riskProfile, setRiskProfile] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);

    // These labels correspond to riskLevel = 1..4
    const riskLevels = [
        { level: 1, label: "Conservative" },
        { level: 2, label: "Moderate" },
        { level: 3, label: "Aggressive" },
        { level: 4, label: "Very Aggressive" },
    ];

    // 1) On mount, fetch the user from the backend
    useEffect(() => {
        async function fetchUser() {
            try {
                const u = await usersService.getUser();
                setUser(u);
                setFirstName(u.firstName);
                setLastName(u.lastName);
                setEmail(u.email);
                setRiskProfile(u.riskLevel);
            } catch (err) {
                console.error("Error loading user:", err);
            }
        }
        fetchUser();
    }, []);

    // 2) Handler for “Save” button
    const onSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            // Build a new User object with updated fields
            const updated: User = {
                ...user,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                riskLevel: riskProfile,
            };

            await usersService.updateUser(updated);
            // Re‐fetch to ensure we have the canonical copy
            const fresh = await usersService.getUser();
            setUser(fresh);
            setFirstName(fresh.firstName);
            setLastName(fresh.lastName);
            setEmail(fresh.email);
            setRiskProfile(fresh.riskLevel);
        } catch (err) {
            console.error("Error saving user:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // While loading initially, show nothing (or you could show a spinner)
    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" className="text-white hover:bg-gray-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            AutoInvestor
                        </Button>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">📈 Dashboard</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Profile</h1>

                {/* Personal Information Card */}
                <Card className="bg-black border-gray-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white text-xl">
                            Personal information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName" className="text-white">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.currentTarget.value)}
                                    className="bg-gray-900 border-gray-700 text-white mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName" className="text-white">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.currentTarget.value)}
                                    className="bg-gray-900 border-gray-700 text-white mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-white">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.currentTarget.value)}
                                className="bg-gray-900 border-gray-700 text-white mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Profile Card */}
                <Card className="bg-black border-gray-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white text-xl">Risk profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            {riskLevels.map((risk) => (
                                <Button
                                    key={risk.level}
                                    variant={riskProfile === risk.level ? "default" : "outline"}
                                    className={
                                        riskProfile === risk.level
                                            ? "bg-white text-black hover:bg-gray-200"
                                            : "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                                    }
                                    onClick={() => setRiskProfile(risk.level)}
                                >
                                    {risk.level}
                                </Button>
                            ))}
                        </div>
                        <Badge variant="secondary" className="bg-gray-800 text-white">
                            {riskLevels[riskProfile - 1].label}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                    className="bg-white hover:bg-gray-200 text-black font-medium px-8"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving…" : "Save"}
                </Button>
            </div>
        </div>
    );
}
