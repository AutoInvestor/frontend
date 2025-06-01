import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft } from "lucide-react";

import { UsersHttpService } from "@/services/users-http-service";
import { User } from "@/model/User";

const usersService = new UsersHttpService();

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [riskProfile, setRiskProfile] = useState<number>(1);
    const [isSaving, setIsSaving] = useState(false);

    const riskLevels = [
        { level: 1, label: "Conservative" },
        { level: 2, label: "Moderate" },
        { level: 3, label: "Aggressive" },
        { level: 4, label: "Very Aggressive" },
    ];

    useEffect(() => {
        (async () => {
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
        })();
    }, []);

    const onSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const updated: User = {
                ...user,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                riskLevel: riskProfile,
            };

            await usersService.updateUser(updated);

            // Refresh data
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

    if (!user) return null;

    const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="min-h-screen bg-background text-foreground">{children}</div>
    );

    return (
        <BaseLayout>
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-border">
                <Link to="/">
                    <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 text-sm">
                        <ArrowLeft className="h-4 w-4" />
                        AutoInvestor
                    </Button>
                </Link>
            </header>

            {/* Main */}
            <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold leading-none">Profile</h1>

                {/* Personal information */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle>Personal information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.currentTarget.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName">Last name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.currentTarget.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.currentTarget.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Risk profile */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle>Risk profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                            {riskLevels.map((risk) => (
                                <Button
                                    key={risk.level}
                                    variant={riskProfile === risk.level ? "default" : "outline"}
                                    onClick={() => setRiskProfile(risk.level)}
                                    className="h-8 px-3 text-sm"
                                >
                                    {risk.level}
                                </Button>
                            ))}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {riskLevels[riskProfile - 1].label}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Save */}
                <Button onClick={onSave} disabled={isSaving} className="h-9 px-6">
                    {isSaving ? "Saving…" : "Save"}
                </Button>
            </div>
        </BaseLayout>
    );
}
