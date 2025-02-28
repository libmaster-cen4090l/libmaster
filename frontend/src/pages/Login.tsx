import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Link, Navigate } from "react-router-dom";

function Login() {
    const auth = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        email: string | null;
        password: string | null;
    }>({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            if (auth.login) {
                await auth.login(formData);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // If already authenticated, redirect to home
    if (auth.token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                    Welcome to LibMaster
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Your FSU library study room reservation system
                </p>
                
                {/* Signup Option for New Users */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="font-semibold text-blue-800 mb-1">New to LibMaster?</h2>
                    <p className="text-blue-700 text-sm mb-2">
                        Create an account to start reserving study rooms at the FSU library.
                    </p>
                    <Link 
                        to="/signup" 
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md font-medium transition-colors duration-200"
                    >
                        Sign up now
                    </Link>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Already have an account?
                        </span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            className="p-2.5 w-full border border-gray-300 rounded-lg"
                            type="text"
                            placeholder="fsuid@fsu.edu"
                            value={formData.email || ""}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                            }}
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="p-2.5 w-full border border-gray-300 rounded-lg"
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
                    
                    {auth.errors.incorrectCredentials && (
                        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                            Incorrect email or password. Please try again.
                        </div>
                    )}
                    
                    <button
                        className="block bg-gray-800 hover:bg-gray-900 w-full p-2.5 text-white rounded-lg text-base font-semibold transition-colors duration-200 disabled:bg-gray-400"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
