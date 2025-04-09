/**
 * ReservationPage component/page
 *
 * Container page for the reservation form that handles room data retrieval
 * and authentication. Fetches detailed room information using the room ID
 * from URL parameters and displays the reservation form when data is retrieved
 *
 * This component implements several safeguards to prevent infinite rendering loops
 * - Uses useRef to track component mounting state
 * - Carefully manages effect dependencies
 * - Implements proper error handling for API requests
 * - Prevents state updates after component unmounting
 *
 * Author(s): Ivan Lepesii, Zack Lima, Colby Leavitt, Dylan Connolly
 * Modified: 3/3/2025 @ 5:49:00 by Dylan
 *
 * @component
 * @requires React
 * @requires react-router-dom
 * @requires ../components/AuthProvider
 * @requires ../contexts/LibraryContext
 * @requires ../api/libraryService
 * @requires ../components/ReservationForm
 */
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth, Role } from "../contexts/AuthProvider";
import { useLibrary } from "../contexts/LibraryContext";
import { Room } from "../api/libraryService";
import ReservationForm from "../components/ReservationForm";

const ReservationPage: React.FC = () => {
    // extract room id from URL parameters
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    // state management for room data, loading status, and errors
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);

    // authentication and library context hooks
    const auth = useAuth();
    const { getRoomById, selectedStartTime, selectedEndTime, error: contextError } = useLibrary();

    // redirect to login if not authenticated
    if (auth.token === null) {
        return <Navigate to="/login" />;
    }

    /**
     * Fetch room data when component mounts or roomId changes
     * Implements safeguards to prevent infinite request loops:
     * - Tracks component mounting state
     * - Limits API calls to once per roomId
     * - Carefully manages dependencies to prevent re-renders
     */
    useEffect(() => {
        // flag to ensure we only fetch once per roomId
        let hasAttemptedFetch = false;

        async function fetchRoomData() {
            if (!roomId || hasAttemptedFetch) return;

            hasAttemptedFetch = true;

            try {
                setLoading(true);
                console.log(
                    "Attempting to fetch room data for roomId:",
                    roomId
                );
                const roomData = await getRoomById(roomId);

                if (roomData) {
                    // check if room is graduate-only and user is not a graduate student
                    if (roomData.is_graduate_only && auth.role !== Role.GRAD) {
                        setLocalError("This room is reserved for graduate students only.");
                        setLoading(false);
                        return;
                    }

                    setRoom(roomData);
                    setLocalError(null);
                } else {
                    setLocalError(`Unable to load room ${roomId}`);
                }
                setLoading(false);
            } catch (err) {
                console.error("Component error fetching room:", err);

                setLocalError(
                    "An error occurred while loading room information"
                );
                setLoading(false);
            }
        }

        fetchRoomData();
    }, [roomId, auth.role]); // include auth.role in dependencies

    // show loading state while fetching room data
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                {/* loading spinner */}
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-600">
                            Loading room information...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // show error state - using either local error or context error
    const errorMessage = localError || contextError;
    if (errorMessage) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                {/* error display */}
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
                            <p className="font-bold">Error</p>
                            <p>{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Return to Library Browser
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If no room data was found, display message
    if (!room) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                {/* no room found message */}
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                    <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-600 mb-4">
                            No room information available.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Return to Library Browser
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show reservation form when we have the room data
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <ReservationForm
                    room={room} 
                    initialStartTime={selectedStartTime}
                    initialEndTime={selectedEndTime}
                />
            </div>
        </div>
    );
};

export default ReservationPage;
