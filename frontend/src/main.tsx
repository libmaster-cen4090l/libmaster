import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Router, Routes } from "react-router";
import Login from "./pages/Login.tsx";
import AuthProvider from "./components/AuthProvider.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import Logout from "./pages/Logout.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<App />} />
                    </Route>
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
