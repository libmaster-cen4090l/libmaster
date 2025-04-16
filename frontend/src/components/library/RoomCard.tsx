// src/components/library/RoomCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Room } from '@/api/libraryService';
import StatusBadge from '../common/StatusBadge';
import AmenityTag from '../common/AmenityTag';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <li
      className={`p-3 rounded-md transition-colors duration-200
        ${
          room.status === "available"
            ? "border-l-4 border-green-500 bg-green-50 hover:bg-green-100"
            : "border-l-4 border-red-500 bg-red-50"
        }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            {room.room_id}
          </h3>
          <p className="text-sm text-gray-600">
            Capacity: {room.capacity}
          </p>
          <div className="flex space-x-2 text-xs mt-1">
            {room.has_whiteboard && (
              <AmenityTag type="whiteboard" className="text-xs" />
            )}
            {room.has_monitor && (
              <AmenityTag type="monitor" className="text-xs" />
            )}
            {room.has_window && (
              <AmenityTag type="window" className="text-xs" />
            )}
            {room.is_graduate_only && (
              <AmenityTag type="grad_only" className="text-xs" />
            )}
            {room.requires_admin_approval && (
              <AmenityTag type="approval_req" className="text-xs" />
            )}
          </div>
        </div>
        <div className="text-right">
          <StatusBadge status={room.status} />

          {room.status === "available" && (
            <div className="mt-2">
              <Link
                to={`/reserve/${room.room_id}`}
                className="bg-blue-500 shadow hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md block text-center transition-colors duration-200"
              >
                Reserve
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default RoomCard;
