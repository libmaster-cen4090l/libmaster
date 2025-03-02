import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    getLibraries,
    getLibraryFloors,
    getFloorRooms,
    getLibraryMaterials,
    Library,
    Floor,
    Room,
    Material
} from '../api/libraryService';

interface LibraryContextType {
    libraries: Library[];
    selectedLibrary: Library | null;
    floors: Floor[];
    selectedFloor: Floor | null;
    rooms: Room[];
    selectedRoom: Room | null;
    materials: Material[];
    loading: {
        libraries: boolean;
        floors: boolean;
        rooms: boolean;
        materials: boolean;
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
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState({
        libraries: false,
        floors: false,
        rooms: false,
        materials: false
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
            fetchMaterials(selectedLibrary.id);
        } else {
            // Clear floors when no library is selected
            setFloors([]);
            setSelectedFloor(null);
            setMaterials([]);
        }
    }, [selectedLibrary]);

    // Fetch rooms when a floor is selected
    useEffect(() => {
        if (selectedFloor) {
            fetchRooms(selectedFloor.id);
        } else {
            // Clear rooms when no floor is selected
            setRooms([]);
            setSelectedRoom(null);
        }
    }, [selectedFloor]);

    const refreshLibraries = async () => {
        setLoading(prev => ({ ...prev, libraries: true }));
        setError(null);
        
        try {
            console.log("Fetching libraries...");
            const data = await getLibraries();
            console.log("Libraries fetched:", data);
            setLibraries(data);
        } catch (err: any) {
            console.error("Error fetching libraries:", err);
            
            // Check if error is related to authentication
            if (err?.response?.status === 401 || 
                err?.response?.data?.code === "token_not_valid") {
                setError("Authentication error. Please log in again.");
            } else {
                setError("Failed to load libraries. Please try again later.");
            }
        } finally {
            setLoading(prev => ({ ...prev, libraries: false }));
        }
    };

    const fetchFloors = async (libraryId: number) => {
        // Clear existing floors and selection
        setFloors([]);
        setSelectedFloor(null);
        setRooms([]);
        setSelectedRoom(null);
        
        setLoading(prev => ({ ...prev, floors: true }));
        setError(null);
        
        try {
            console.log(`Fetching floors for library ${libraryId}...`);
            const data = await getLibraryFloors(libraryId);
            console.log(`Floors fetched for library ${libraryId}:`, data);
            
            // Double-check the data to ensure each floor belongs to the selected library
            const filteredFloors = data.filter(floor => floor.library === libraryId);
            
            if (filteredFloors.length !== data.length) {
                console.warn(`Filtered out ${data.length - filteredFloors.length} floors that didn't match library ID ${libraryId}`);
            }
            
            setFloors(filteredFloors);
        } catch (err: any) {
            console.error(`Error fetching floors for library ${libraryId}:`, err);
            
            // Check if error is related to authentication
            if (err?.response?.status === 401 || 
                err?.response?.data?.code === "token_not_valid") {
                setError("Authentication error. Please log in again.");
            } else {
                setError(`Failed to load floors for library ${libraryId}. Please try again later.`);
            }
        } finally {
            setLoading(prev => ({ ...prev, floors: false }));
        }
    };

    const fetchRooms = async (floorId: number) => {
        // Clear existing rooms and selection
        setRooms([]);
        setSelectedRoom(null);
        
        setLoading(prev => ({ ...prev, rooms: true }));
        setError(null);
        
        try {
            console.log(`Fetching rooms for floor ${floorId}...`);
            const data = await getFloorRooms(floorId);
            console.log(`Rooms fetched for floor ${floorId}:`, data);
            
            // Double-check the data to ensure each room belongs to the selected floor
            const filteredRooms = data.filter(room => room.floor === floorId);
            
            if (filteredRooms.length !== data.length) {
                console.warn(`Filtered out ${data.length - filteredRooms.length} rooms that didn't match floor ID ${floorId}`);
            }
            
            setRooms(filteredRooms);
        } catch (err: any) {
            console.error(`Error fetching rooms for floor ${floorId}:`, err);
            
            // Check if error is related to authentication
            if (err?.response?.status === 401 || 
                err?.response?.data?.code === "token_not_valid") {
                setError("Authentication error. Please log in again.");
            } else {
                setError(`Failed to load rooms for floor ${floorId}. Please try again later.`);
            }
        } finally {
            setLoading(prev => ({ ...prev, rooms: false }));
        }
    };

    const fetchMaterials = async (libraryId: number) => {
        setMaterials([]);
        setLoading(prev => ({ ...prev, materials: true }));
    
        try {
            console.log(`Fetching materials for library ${libraryId}...`);
            const data = await getLibraryMaterials(libraryId);
            console.log("Materials fetched:", data);
            setMaterials(data);
        } catch (err: any) {
            console.error(`Error fetching materials for library ${libraryId}:`, err);
            setError(`Failed to load materials for library ${libraryId}.`);
        } finally {
            setLoading(prev => ({ ...prev, materials: false }));
        }
    };
    

    const selectLibrary = (library: Library | null) => {
        console.log("Selecting library:", library?.id, library?.name);
        // Only update if different from current selection
        if (library?.id !== selectedLibrary?.id) {
            setSelectedLibrary(library);
            // Reset floor and room selections when library changes
            setSelectedFloor(null);
            setSelectedRoom(null);
            setFloors([]);
            setRooms([]);
            setMaterials([]);
        }
    };

    const selectFloor = (floor: Floor | null) => {
        console.log("Selecting floor:", floor?.id, floor?.number);
        // Only update if different from current selection
        if (floor?.id !== selectedFloor?.id) {
            setSelectedFloor(floor);
            // Reset room selection when floor changes
            setSelectedRoom(null);
            setRooms([]);
        }
    };

    const selectRoom = (room: Room | null) => {
        console.log("Selecting room:", room?.room_id);
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
                materials,
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