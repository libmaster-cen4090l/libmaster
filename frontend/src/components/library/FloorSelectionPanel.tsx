// src/components/library/FloorSelectionPanel.tsx
import React from 'react';
import { Floor, Library } from '@/api/libraryService';
import LoadingSpinner from '../common/LoadingSpinner';

interface FloorSelectionPanelProps {
  floors: Floor[];
  selectedLibrary: Library | null;
  selectedFloor: Floor | null;
  loading: boolean;
  onSelectFloor: (floor: Floor) => void;
}

const FloorSelectionPanel: React.FC<FloorSelectionPanelProps> = ({
  floors,
  selectedLibrary,
  selectedFloor,
  loading,
  onSelectFloor
}) => {

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {selectedLibrary
          ? `Floors - ${selectedLibrary.name}`
          : "Select a Library"}
      </h2>

      {!selectedLibrary && !loading && (
        <p className="text-gray-500 text-center py-4">
          Please select a library first
        </p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <ul className="space-y-2">
          {floors.map((floor) => (
            <li
              key={floor.id}
              className={`p-3 rounded-md cursor-pointer transition-colors duration-200
                ${
                  selectedFloor?.id === floor.id
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : "hover:bg-gray-100"
                }`}
              onClick={() => onSelectFloor(floor)}
            >
              <h3 className="font-medium">
                Floor {floor.number}
              </h3>
              {floor.description && (
                <p className="text-xs text-gray-500">
                  {floor.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {floors.length === 0 && selectedLibrary && !loading && (
        <p className="text-gray-500 text-center py-4">
          No floors available for this library.
        </p>
      )}
    </div>
  );
};

export default FloorSelectionPanel;
