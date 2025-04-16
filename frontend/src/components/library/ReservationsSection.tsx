// src/components/library/ReservationsSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import RecentReservations from '../reservations/RecentReservations';

interface ReservationsSectionProps {
  isAuthenticated: boolean;
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({ isAuthenticated }) => {
  if (!isAuthenticated) return null;
  
  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            My Current Reservations
          </h2>
          <Link
            to="/my-reservations"
            className="text-blue-500 hover:text-blue-700"
          >
            View All
          </Link>
        </div>

        <RecentReservations />
      </div>
    </div>
  );
};

export default ReservationsSection;
