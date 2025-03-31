/**
 * MyReservations Page
 *
 * A dedicated page for users to view and manage all their room reservations .
 * Provides comprehensive reservation details and allows users to cancel active
 * reservations. Requires authentication and redirects to login if user isn't
 * currently auth'd.
 *
 * @components
 * @requires React
 * @requires react-router-dom
 * @requires ../components/AuthProvider
 * @requires ../api/axiosInstance
 * @requires ../api/libraryService
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import api from "../api/axiosInstance";
import { Reservation } from "../api/libraryService";
import { cancelReservation as cancelReservationApi } from "../api/libraryService";

const MyReservations: React.FC = () => {
    // state management for reservations, loading sttus, and errors
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // redirect to login if user is not authenticated
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Fetches all of the user's reservations from the API
         * The backend filters reservations based on the authenticated user
         */
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const response = await api.get("/rooms/reservations/");
                // console.log("Reservations data:", response.data);
                setReservations(response.data.results || []);
                setError(null);
            } catch (err: any) {
                console.error("Failed to load reservations:", err);
                if (err.response?.status === 401) {
                    setError("Your session has expired. Please log in again.");
                } else {
                    setError(
                        "Failed to load your reservations. Please try again later."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [navigate]);

    /**
     * Formats a date string into a user-friendly format
     * @param {string} dateString - ISO format date string
     * @returns {string} Formatted date and time
     */
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    /**
     * Cancels a reservation by updating its status to 'cancelled'
     * @param {string} reservationId - UUID of the reservation to cancel
     */
    const cancelReservation = async (reservationId: string) => {
        if (!confirm("Are you sure you want to cancel this reservation?")) {
            return;
        }
        // use libraryservice's cancellation function instead of http patch
        try {
          const success = await cancelReservationApi(reservationId);

          if (success) {
            // update the local state
            setReservations((prevReservations) =>
                prevReservations.map((res) =>
                    res.reservation_id === reservationId
                    ? { ...res, status: "cancelled" }
                    : res
                )
            );
          }
        } catch (err) {
            alert("Failed to cancel reservation");
            console.error(err);
        }
    };

    // render the my reservations page with header, nav, res list
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Reservations</h1>
                    <div className="flex gap-4">
                        <Link
                            to="/"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Back to Library Browser
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-gray-600 mb-4">
                            You don't have any reservations yet.
                        </p>
                        <Link
                            to="/"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Find a Room
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((reservation) => (
                            <div
                                key={reservation.reservation_id}
                                className="bg-white p-4 rounded-lg shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            Room{" "}
                                            {reservation.room_id ||
                                                reservation.room}
                                        </h3>
                                        <p className="text-gray-600">
                                            {formatDateTime(
                                                reservation.start_time
                                            )}{" "}
                                            -{" "}
                                            {formatDateTime(
                                                reservation.end_time
                                            )}
                                        </p>
                                        {reservation.purpose && (
                                            <p className="mt-2">
                                                <strong>Purpose:</strong>{" "}
                                                {reservation.purpose}
                                            </p>
                                        )}
                                        <p>
                                            <strong>Attendees:</strong>{" "}
                                            {reservation.num_attendees}
                                        </p>
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-sm font-semibold 
                      ${
                          reservation.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : reservation.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                                        >
                                            {reservation.status}
                                        </span>
                                    </div>
                                </div>

                                {(reservation.status === "confirmed" ||
                                    reservation.status === "pending") && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() =>
                                                cancelReservation(
                                                    reservation.reservation_id
                                                )
                                            }
                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                        >
                                            Cancel Reservation
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReservations;
