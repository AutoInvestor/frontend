import {Navigate, useLocation} from "react-router-dom";
import {ReactNode} from "react";
import useAuth from "@/hooks/useAuth.ts";

export function RequireAuth({children}: { children: ReactNode }) {
    const {isAuthenticated, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                {children}
            </>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return <>{children}</>;
}