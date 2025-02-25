import React, { Suspense, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "@/components/AuthProvider";
import { Navigate } from "react-router";

function Signup() {
    const auth = useAuth();
    const [formData, setFormData] = useState<{
        email: string | null;
        password: string | null;
    }>({ email: null, password: null });

    return auth.token == null ? (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
            <div className="w-full md:w-1/2 lg:w-1/4">
                <h1 className="text-3xl font-bold text-gray-900 text-center">
                    Signup
                </h1>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (auth.signup) await auth.signup(formData);
                        // console.log(formData);
                    }}
                >
                    <label htmlFor="email" className="text-sm font-semibold">
                        Email
                    </label>
                    <input
                        name="email"
                        className="p-2.5 w-full border border-gray-900 rounded-lg mb-2"
                        type="text"
                        placeholder="fsuid@fsu.edu"
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                        }}
                    ></input>
                    <label htmlFor="password" className="text-sm font-semibold">
                        Password
                    </label>
                    <input
                        name="password"
                        type="password"
                        placeholder="password"
                        className="p-2.5 w-full border border-gray-900 rounded-lg mb-2"
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            });
                        }}
                    ></input>
                    <button
                        className="block bg-slate-700 w-full p-2.5 px-4 text-white rounded-lg mt-2 text-base font-semibold"
                        type="submit"
                    >
                        Sign up
                    </button>
                </form>
            </div>
        </div>
    ) : (
        <Navigate to="/" />
    );
}

export default Signup;
