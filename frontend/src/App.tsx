/**
 * App Component
 *
 * Root componentfor the LibMaster application.
 * Serves as a container for the main content and nested routes.
 *
 * Author(s): Ivan Lepesii, Zack Lima, Colby Leavitt, Dylan Connolly
 * Modified: 3/3/2025 @ 3:39:41 EST by Dylan
 *
 * MODIFICATIONS:
 * - Simplified component structure to focus on LibraryBrowser
 * - Maintained LibraryProvider wrapper for backward compatibility
 * - Note: The LibraryProvider here is now redundant since main.tsx also wraps
 *   everything in LibraryProvider, but is kept for component-level functionality
 *
 * @component
 * @requires React
 * @requires react-router-dom
 * @requires ./contexts/LibraryContext
 * @requires ./components/LibraryBrowser
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LibraryBrowser from "./components/library/LibraryBrowser";
import ReservationPage from "./pages/ReservationPage";
import MyReservations from "./pages/MyReservations";

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="">
                <Routes>
                    {/* Note: No leading slashes in paths since these are relative routes */}
                    <Route index element={<LibraryBrowser />} />
                    <Route
                        path="reserve/:roomId"
                        element={<ReservationPage />}
                    />
                    <Route
                        path="my-reservations"
                        element={<MyReservations />}
                    />
                    {/* This catch-all route should be last */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
