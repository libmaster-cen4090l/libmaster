// src/components/library/MaterialsDisplay.tsx
import React from 'react';
import { Library, Material } from '@/api/libraryService';
import LoadingSpinner from '../common/LoadingSpinner';

interface MaterialsDisplayProps {
  selectedLibrary: Library | null;
  materials: Material[];
  loading: boolean;
}

const MaterialsDisplay: React.FC<MaterialsDisplayProps> = ({
  selectedLibrary,
  materials,
  loading
}) => {
  if (!selectedLibrary) return null

  /**
   * Formats material name for display by replacing underscores with spaces
   * and converting to uppercase
   */
  const formatMaterialName = (name: string): string => {
    return name.replace("_", " ").toUpperCase();
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">
        Available Materials at {selectedLibrary.name}
      </h2>
      
      {loading ? (
        <LoadingSpinner />
      ) : materials.length > 0 ? (
        <ul className="list-disc ml-6 mt-2">
          {materials.map((material) => (
            <li key={material.id} className="text-gray-700">
              {formatMaterialName(material.name)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 italic py-2">
          No materials available.
        </p>
      )}
    </div>
  );
};

export default MaterialsDisplay;
