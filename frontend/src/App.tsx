// // App.tsx
// Author(s): Colby Leavitt
// Purpose: Display libraries, floors, and eventually rooms to users
//          when they log in.
// Modified: 2/28/2025 @4:10 AM
import React, { useEffect, useState } from "react";

const LibraryList: React.FC = () => {
  const [libraries, setLibraries] = useState<any[]>([]); // Stores the libraries
  const [floors, setFloors] = useState<Record<number, any[]>>({}); // Floors for each library, indexed by library ID
  const [expandedLibraryId, setExpandedLibraryId] = useState<number | null>(null); // Tracks the expanded library
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch libraries from API
  const fetchLibraries = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/rooms/libraries/");
      if (!response.ok) throw new Error("Error fetching libraries");
      const data = await response.json();
      setLibraries(data.results);
    } catch (error) {
      setError("Error fetching libraries");
    } finally {
      setLoading(false);
    }
  };

  // Fetch floors for a specific library
  const fetchFloors = async (libraryId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/rooms/libraries/${libraryId}/floors/`);
      if (!response.ok) throw new Error("Error fetching floors");
      const data = await response.json();
      setFloors((prevFloors) => ({
        ...prevFloors,
        [libraryId]: data.results, // Update floors for this specific library
      }));
    } catch (error) {
      setError("Error fetching floors");
    }
  };

  // Toggle the floors visibility for a given library
  const toggleFloors = (libraryId: number) => {
    if (expandedLibraryId === libraryId) {
      setExpandedLibraryId(null); // Close if already expanded
    } else {
      setExpandedLibraryId(libraryId); // Expand for the selected library
      if (!floors[libraryId]) {
        fetchFloors(libraryId); // Fetch floors only if they haven't been fetched yet
      }
    }
  };

  useEffect(() => {
    fetchLibraries(); // Fetch libraries on mount
  }, []);

  if (loading) return <div>Loading libraries...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold">Available Libraries</h2>
      <ul>
        {libraries.map((library) => (
          <li key={library.id} className="py-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{library.name}</span>
              <button
                onClick={() => toggleFloors(library.id)}
                className="ml-4 text-sm text-blue-500 hover:underline"
              >
                {expandedLibraryId === library.id ? "Hide Floors" : "Show Floors"}
              </button>
            </div>

            {/* Only show floors for the expanded library */}
            {expandedLibraryId === library.id && floors[library.id] && (
              <div className="ml-6 mt-2">
                <h3 className="font-semibold">Floors:</h3>
                {floors[library.id].map((floor) => (
                  <div key={floor.id} className="py-1">
                    <span className="text-md">Floor {floor.number}</span> - {floor.description}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LibraryList;
