import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getLibraries,
    getLibraryFloors,
    getFloorRooms,
    Library,
    Floor,
    Room
} from '../api/libraryService';

interface LibraryContextType {
    libraries: Library[];
    selectedLibrary: Library | null;
    floors: Floor[];
    selectedFloor: Floor | null;
    rooms: Room[];
    selectedRoom: Room | null;
    loading: {
        libraries: boolean;
        floors: boolean;
        rooms: boolean;
    };
    error: string | null;
    selectLibrary: (library: Library | null) => void;
    selectFloor: (floor: Floor | null) => void;
    selectRoom: (room: Room | null) => void;
    refreshLibraries: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState({
    libraries: false,
    floors: false,
    rooms: false
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch libraries on mount
  useEffect(() => {
    refreshLibraries();
  }, []);

  // Fetch floors when a library is selected
  useEffect(() => {
    if (selectedLibrary) {
      fetchFloors(selectedLibrary.id);
    } else {
      setFloors([]);
      setSelectedFloor(null);
    }
  }, [selectedLibrary]);

  // Fetch rooms when a floor is selected
  useEffect(() => {
    if (selectedFloor) {
      fetchRooms(selectedFloor.id);
    } else {
      setRooms([]);
      setSelectedRoom(null);
    }
  }, [selectedFloor]);

  const refreshLibraries = async () => {
    setLoading(prev => ({ ...prev, libraries: true }));
    setError(null);
    
    try {
      const data = await getLibraries();
      setLibraries(data);
    } catch (err) {
      setError("Failed to load libraries. Please try again later.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, libraries: false }));
    }
  };

  const fetchFloors = async (libraryId: number) => {
    setLoading(prev => ({ ...prev, floors: true }));
    setError(null);
    
    try {
      const data = await getLibraryFloors(libraryId);
      setFloors(data);
    } catch (err) {
      setError("Failed to load floors. Please try again later.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, floors: false }));
    }
  };

  const fetchRooms = async (floorId: number) => {
    setLoading(prev => ({ ...prev, rooms: true }));
    setError(null);
    
    try {
      const data = await getFloorRooms(floorId);
      setRooms(data);
    } catch (err) {
      setError("Failed to load rooms. Please try again later.");
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  const selectLibrary = (library: Library | null) => {
    setSelectedLibrary(library);
  };

  const selectFloor = (floor: Floor | null) => {
    setSelectedFloor(floor);
  };

  const selectRoom = (room: Room | null) => {
    setSelectedRoom(room);
  };

  return (
    <LibraryContext.Provider
      value={{
        libraries,
        selectedLibrary,
        floors,
        selectedFloor,
        rooms,
        selectedRoom,
        loading,
        error,
        selectLibrary,
        selectFloor,
        selectRoom,
        refreshLibraries
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};