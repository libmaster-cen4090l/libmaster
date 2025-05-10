// src/components/library/ReservationsSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import RecentReservations from "../reservations/RecentReservations";

interface ReservationsSectionProps {
    isAuthenticated: boolean;
    numberOfReservations: number;
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({
    isAuthenticated,
    numberOfReservations,
}) => {
    if (!isAuthenticated) return null;

    return (
        <div className="">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Reservations
                    </h2>
                    <Link
                        to="/my-reservations"
                        className="text-blue-500 hover:text-blue-700"
                    >
                        View All
                    </Link>
                </div>

                <RecentReservations
                    numberOfReservations={numberOfReservations}
                />
            </div>
        </div>
    );
};

export default ReservationsSection;
