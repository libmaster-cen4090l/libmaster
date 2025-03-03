/**
 * Main Application Entry Point
 *
 * Configures React application with routing and context providers.
 * Renders the application's component tree with proper context hierarchy.
 *
 * Author(s): Ivan Lepesii, Zack Lima, Colby Leavitt, Dylan Connolly
 * Modified: 3/3/2025 @ 2:59:53 EST by Dylan
 *
 * MODIFICATIONS:
 * - Added routes for reservation management pages
 * - Ensured all routes are properly wrapped with LibraryProvider
 * - Updated private route protection for authenticated pages
 * - Reorganized route structure for clarity
 *
 * @file
 * @requires React
 * @requires react-dom/client
 * @requires react-router-dom
 * @requires ./App
 * @requires ./components/AuthProvider
 * @requires ./components/PrivateRoute
 * @requires ./contexts/LibraryContext
 * @requires ./pages/Login
 * @requires ./pages/Logout
 * @requires ./pages/Signup
 * @requires ./pages/ReservationPage
 * @requires ./pages/MyReservations
 */ 

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Router, Routes } from "react-router";
import Login from "./pages/Login.tsx";
import AuthProvider from "./components/AuthProvider.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import Logout from "./pages/Logout.tsx";
import Signup from "./pages/Signup.tsx";
import { LibraryProvider } from "./contexts/LibraryContext.tsx";
import LibraryBrowser from "./components/LibraryBrowser.tsx";
import ReservationPage from "./pages/ReservationPage.tsx";
import MyReservations from "./pages/MyReservations.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              { /* MODIFIED: Wrapped all routes in LibraryProvider to ensure context access */ }
              <LibraryProvider> 
                  <Routes>
                      { /* Protected routes requiring authentication */ }
                      <Route element={<PrivateRoute />}>
                          { /* ADDED: configured routing for reservations in App.tsx */ }
                          <Route path="/" element={<App />} />
                          { /* ADDED: new routes for reservation functionality */ }
                          <Route path="/reserve/:roomId" element={<ReservationPage />} />
                          <Route path="/my-reservations" element={<MyReservations />} />
                      </Route>
                      <Route path="/login" element={<Login />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/signup" element={<Signup />} />
                  </Routes>
              </LibraryProvider>
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>
);
