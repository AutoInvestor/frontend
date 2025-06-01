import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth.ts";
import { ArrowRightIcon } from "lucide-react";

const Hero = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-tight tracking-tight">
                    AutoInvestor
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                    Your complete investment portfolio management solution. Track, analyze
                    and optimise your investments with real‑time insights.
                </p>

                {!isAuthenticated
                    ? <a href="/api/oauth2/authorization/okta">
                        <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium rounded-lg">Continue with Okta</Button>
                    </a>
                    : <Link className={"flex items-center"} to={"/dashboard"}>Go to your dashboard <ArrowRightIcon className={"ms-2 inline-block size-6"}/></Link>}

                <div className="h-2"></div>

                <p className="text-sm text-muted-foreground">
                    Secure authentication • Real‑time data • Smart insights
                </p>
            </div>
        </div>
    );
};

export default Hero;