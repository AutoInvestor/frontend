import {createContext} from "react";

export interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    loading: true,
});