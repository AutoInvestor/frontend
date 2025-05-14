import {useContext} from "react";
import {AuthContext} from "@/contexts/AuthContext.ts";

const useAuth = () => useContext(AuthContext);
export default useAuth;
