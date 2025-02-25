import React, { useEffect } from "react";
import api from "@/api/axiosInstance";
import { useAuth } from "@/components/AuthProvider";

function Logout() {
    const auth = useAuth();

    useEffect(() => {
        const logout = async () => {
            const response = await api.post("auth/logout/");
            if (response.status == 200 && auth.clearToken) auth.clearToken();
        };

        logout();
    }, [auth]);

    return auth.token === null ? (
        <div>Succesfully logged out!</div>
    ) : (
        <div>Logging out...</div>
    );
}

export default Logout;
