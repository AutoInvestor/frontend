import {ReactNode, useEffect, useState} from "react";
import {UsersHttpService} from "@/services/users-http-service.ts";
import {AuthContext} from "@/contexts/AuthContext.ts";

const userHttpService = new UsersHttpService();

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await userHttpService.getUser();
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth().then();
    }, []);

    return (
        <AuthContext.Provider value={{isAuthenticated, loading}}>
            {children}
        </AuthContext.Provider>
    );
};
