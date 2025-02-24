import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

function Login() {
    const [res, setRes] = useState();
    const sendrequest = async () => {
        const response = await api.post("auth/token/", {
            username: "yuki",
            password: "24424224",
        });
        setRes(response.data.access);
    };

    useEffect(() => {
        sendrequest();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900">Login</h1>
            <p>Response: {res}</p>
        </div>
    );
}

export default Login;
