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
    }>({ email: null, password: null });

    // add state for error handling
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        general?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // clear previous errors
        setErrors({});

        // form validation
        if (!formData.email) {
            setErrors(prev => ({ ...prev, email: "Email is required" }));
            return;
        }

        if (!formData.password) {
            setErrors(prev => ({ ...prev, password: "Password is required" }));
            return;
        }

        setIsSubmitting(true);

        try {
            if (auth.signup) {
                await auth.signup(formData);
            }
        } catch (error) {
            // handle specific backend errors
            if (error instanceof AxiosError && error.response) {
                const { data, status } = error.response;

                if (status === 400) {
                    // handle validation errors
                    if (data.username) {
                        setErrors(prev => ({
                            ...prev,
                            email: Array.isArray(data.username)
                                ? data.username[0]
                                : "This email is already in use or invalid"
                        }));
                    }

                    if (data.password) {
                        setErrors(prev => ({
                            ...prev,
                            password: Array.isArray(data.password)
                                ? data.password[0]
                                : "Password is not valid"
                        }));
                    }

                    // handle non-field errors
                    if (data.non_field_errors) {
                        setErrors(prev => ({
                            ...prev,
                            general: Array.isArray(data.non_field_errors)
                                ? data.non_field_errors[0]
                                : "Unable to create account"
                        }));
                    }
                } else {
                    // generic server error
                    setErrors(prev => ({
                        ...prev,
                        general: "An error occurred while creating your account. Please try again."
                    }));
                }
            } else {
                // fallback error message
                setErrors(prev => ({
                    ...prev,
                    general: "An unexpected error occurred. Please try again."
                }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // redirect to home if already authenticated
    if (auth.token) {
        return <Navigate to="/" />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                    Create an Account
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Join LibMaster to reserve FSU library study rooms
                </p>

                {/* display general errors */}
                {errors.general && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            className={`p-2.5 w-full border ${
                                errors.email ? "border-red-500" : "border-gray-300"
                            } rounded-lg`}
                            type="email"
                            placeholder="fsuid@fsu.edu"
                            value={formData.email || ""}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                });
                                // clear error when typing
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: undefined }));
                                }
                            }}
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className={`p-2.5 w-full border ${
                                errors.password ? "border-red-500" : "border-gray-300"
                            } rounded-lg`}
                            value={formData.password || ""}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                });
                                // clear error when typing
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: undefined }));
                                }
                            }}
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        className="block bg-gray-800 hover:bg-gray-900 w-full p-2.5 text-white rounded-lg text-base font-semibold transition-colors duration-200 disabled:bg-gray-400"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>    );
}

export default Signup;
