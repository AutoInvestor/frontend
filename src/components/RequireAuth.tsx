import {Navigate, useLocation} from "react-router-dom";
import {ReactNode} from "react";
import useAuth from "@/hooks/useAuth.ts";
import {LoadingLayer} from "@/components/LoadingLayer.tsx";

export function RequireAuth({children}: { children: ReactNode }) {
    const {isAuthenticated, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <>
                <LoadingLayer />
                {children}
            </>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return <>{children}</>;
}