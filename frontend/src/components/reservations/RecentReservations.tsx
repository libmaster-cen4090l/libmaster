/**
 * RecentReservations Component
 *
 * Displays a summary of the user's most recent reservations on the
 * main library browser page. This component fetches a limited number
 * of the user's active reservations from the API, providing a quick
 * overview without requiring navigation to the full reservations page.
 *
 * @component
 * @requires React
 * @requires react-router-dom
 * @requires ../api/axiosInstance
 * @requires ../api/libraryService
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import { Reservation } from "../../api/libraryService";

interface RecentReservationProps {
    numberOfReservations: number;
}

const RecentReservations: React.FC<RecentReservationProps> = ({
    numberOfReservations,
}) => {
    // state management for reservations data, loading status, error handling
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        /**
         * Fetches the user's most recent reservations from the API
         * Limited to 3 reservations to keep the display compact
         */
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const response = await api.get("/rooms/reservations/", {
                    params: {
                        limit: 3, // Only get the most recent 3 reservations (DOES NOT WORK)
                        status: "confirmed,pending", // Only active reservations
                    },
                });

                setReservations(response.data.results || []);
            } catch (err) {
                console.error("Failed to load recent reservations:", err);
                setError("Unable to load your reservations");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    // Format date and time for display
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return (
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
    };

    // display loading spinner while fetching reservations
    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // display error message if reservation fetching fails
    if (error) {
        return <div className="text-red-600 py-2">{error}</div>;
    }

    // display message when user has no reservations
    if (reservations.length === 0) {
        return (
            <div className="text-gray-500 py-4 text-center">
                You don't have any active reservations.
                <div className="mt-2">
                    <Link to="/" className="text-blue-500 hover:underline">
                        Browse available rooms
                    </Link>
                </div>
            </div>
        );
    }

    // display a list of user's recent reservations
    return (
        <div className="space-y-3">
            {/* map through reservations and render each one */}
            {reservations.slice(0, numberOfReservations).map((reservation) => (
                <div
                    key={reservation.reservation_id}
                    className="border-b pb-3 last:border-b-0 flex justify-between"
                >
                    <div>
                        <div className="font-medium">
                            Room {reservation.room_id || reservation.room}
                        </div>
                        <div className="text-sm text-gray-600">
                            {formatDateTime(reservation.start_time)} -{" "}
                            {formatDateTime(reservation.end_time)}
                        </div>
                        {reservation.purpose && (
                            <div className="text-sm text-gray-600">
                                {reservation.purpose}
                            </div>
                        )}
                    </div>
                    <div>
                        <span
                            className={`inline-block shadow px-2 py-1 rounded-full text-xs font-semibold 
              ${
                  reservation.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : reservation.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
              }`}
                        >
                            {reservation.status}
                        </span>
                    </div>
                </div>
            ))}

            {/* <div className="pt-2 text-center">
                <Link
                    to="/my-reservations"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    Manage reservations
                </Link>
            </div> */}
        </div>
    );
};

export default RecentReservations;
