// src/components/library/RoomsPanel.tsx
import React from 'react';
import { Room, Floor } from '@/api/libraryService';
import LoadingSpinner from '../common/LoadingSpinner';
import RoomCard from './RoomCard';

interface RoomsPanelProps {
  rooms: Room[];
  selectedFloor: Floor | null;
  loading: boolean;
}

const RoomsPanel: React.FC<RoomsPanelProps> = ({
  rooms,
  selectedFloor,
  loading
}) => {
  return (
    <div className="bg-white p-6 col-span-3 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {selectedFloor
          ? `Rooms - Floor ${selectedFloor.number}`
          : "Select a Floor"}
      </h2>

      {!selectedFloor && !loading && (
        <p className="text-gray-500 text-center py-4">
          Please select a floor first
        </p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <RoomCard key={room.room_id} room={room} />
          ))}
        </ul>
      )}

      {rooms.length === 0 && selectedFloor && !loading && (
        <p className="text-gray-500 text-center py-4">
          No rooms available on this floor.
        </p>
      )}
    </div>
  );
};

export default RoomsPanel;
