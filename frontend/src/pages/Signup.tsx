import React, { Suspense, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "@/contexts/AuthProvider";
import { Navigate } from "react-router";

function Signup() {
    const auth = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        email: string | null;
        password: string | null;
    }>({ email: "", password: "" });
    
    // add error state
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            setError("Email and password are required");
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            if (auth.signup) {
                await auth.signup(formData);
            }
        } catch (err) {
            // display error message
            setError("Failed to create account. This email may already be registered.");
            console.error("Signup error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (auth.token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
                    Sign Up for LibMaster
                </h1>
                
                {/* display error messages */}
                {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                
                {auth.errors.incorrectCredentials && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        Something went wrong. Please try again.
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                            FSU Email
                        </label>
                        <input
                            name="email"
                            id="email"
                            className="p-2.5 w-full border border-gray-300 rounded-lg mb-2"
                            type="email"
                            placeholder="fsuid@fsu.edu"
                            value={formData.email || ""}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                            }}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="p-2.5 w-full border border-gray-300 rounded-lg mb-2"
                            value={formData.password || ""}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                });
                            }}
                            required
                        />
                    </div>
                    
                    <button
                        className="block bg-gray-800 hover:bg-gray-900 w-full p-2.5 text-white rounded-lg text-base font-semibold transition-colors duration-200 disabled:bg-gray-400"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
