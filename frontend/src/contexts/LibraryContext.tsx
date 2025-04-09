/**
 * LibraryContext
 *
 * Context provider for library-related data and operations.
 * Manages state for libraries, floors, rooms, and materials.
 * Provides functions for fetching and selecting library entities.
 *
 * Author(s): Dylan Connolly
 * Modified: 3/3/2025 @ 2:43:38 EST
 *
 * MODIFICATIONS:
 * - Added getRoomById function to fetch detailed room information
 * - Implemented robust error handling for API requests
 * - Added fallback mechanisms for URL routing inconsistencies
 * - Updated the context interface to include the new function
 *
 * @context
 * @requires React
 * @requires axios
 * @requires ../api/axiosInstance
 * @requires ../api/libraryService
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import axios from "axios";
import {
    getLibraries,
    getLibraryFloors,
    getFloorRooms,
    getLibraryMaterials,
    Library,
    Floor,
    Room,
    Material,
    getFilteredRooms,
} from "../api/libraryService";

import api from "../api/axiosInstance";
import roomApi from "../api/axiosInstance";

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
    selectedStartTime: Date | null;
    selectedEndTime: Date | null;
    error: string | null;
    selectLibrary: (library: Library | null) => void;
    selectFloor: (floor: Floor | null) => void;
    selectRoom: (room: Room | null) => void;
    setStartTime: (start: Date | null) => void;
    setEndTime: (end: Date | null) => void;
    refreshLibraries: () => Promise<void>;

    /**
     * Fetches detailed information for a specific room by its room_id
     * First checks local state before making an API request
     *
     * @params {string} roomId - The unique identifier for the room
     * @returns {Promise<Room | null>} Room data or null if not found
     */
    getRoomById: (roomId: string) => Promise<Room | null>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(
        null
    );
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
    const [selectedStartTime, setStartTime] = useState<Date | null>(null);
    const [selectedEndTime, setEndTime] = useState<Date | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState({
        libraries: false,
        floors: false,
        rooms: false,
        materials: false,
        singleRoom: false,
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

    useEffect(() => {
        if (selectedStartTime && selectedEndTime) {
            fetchFilteredRooms(
                selectedFloor?.id,
                selectedStartTime,
                selectedEndTime
            );
        }
    }, [selectedStartTime, selectedEndTime, selectedFloor?.id]);

    const refreshLibraries = async () => {
        setLoading((prev) => ({ ...prev, libraries: true }));
        setError(null);

        try {
            // console.log("Fetching libraries...");
            const data = await getLibraries();
            // console.log("Libraries fetched:", data);
            setLibraries(data);
        } catch (err: any) {
            console.error("Error fetching libraries:", err);

            // Check if error is related to authentication
            if (
                err?.response?.status === 401 ||
                err?.response?.data?.code === "token_not_valid"
            ) {
                setError("Authentication error. Please log in again.");
            } else {
                setError("Failed to load libraries. Please try again later.");
            }
        } finally {
            setLoading((prev) => ({ ...prev, libraries: false }));
        }
    };

    const fetchFloors = async (libraryId: number) => {
        // Clear existing floors and selection
        setFloors([]);
        setSelectedFloor(null);
        setRooms([]);
        setSelectedRoom(null);

        setLoading((prev) => ({ ...prev, floors: true }));
        setError(null);

        try {
            // console.log(`Fetching floors for library ${libraryId}...`);
            const data = await getLibraryFloors(libraryId);
            // console.log(`Floors fetched for library ${libraryId}:`, data);

            // Double-check the data to ensure each floor belongs to the selected library
            const filteredFloors = data.filter(
                (floor) => floor.library === libraryId
            );

            if (filteredFloors.length !== data.length) {
                console.warn(
                    `Filtered out ${
                        data.length - filteredFloors.length
                    } floors that didn't match library ID ${libraryId}`
                );
            }

            setFloors(filteredFloors);
        } catch (err: any) {
            console.error(
                `Error fetching floors for library ${libraryId}:`,
                err
            );

            // Check if error is related to authentication
            if (
                err?.response?.status === 401 ||
                err?.response?.data?.code === "token_not_valid"
            ) {
                setError("Authentication error. Please log in again.");
            } else {
                setError(
                    `Failed to load floors for library ${libraryId}. Please try again later.`
                );
            }
        } finally {
            setLoading((prev) => ({ ...prev, floors: false }));
        }
    };

    const fetchRooms = async (floorId: number) => {
        // Clear existing rooms and selection
        setRooms([]);
        setSelectedRoom(null);

        setLoading((prev) => ({ ...prev, rooms: true }));
        setError(null);

        try {
            // console.log(`Fetching rooms for floor ${floorId}...`);
            const data = await getFloorRooms(floorId);
            // console.log(`Rooms fetched for floor ${floorId}:`, data);

            // Double-check the data to ensure each room belongs to the selected floor
            const filteredRooms = data.filter((room) => room.floor === floorId);

            if (filteredRooms.length !== data.length) {
                console.warn(
                    `Filtered out ${
                        data.length - filteredRooms.length
                    } rooms that didn't match floor ID ${floorId}`
                );
            }

            setRooms(filteredRooms);
        } catch (err: any) {
            console.error(`Error fetching rooms for floor ${floorId}:`, err);

            // Check if error is related to authentication
            if (
                err?.response?.status === 401 ||
                err?.response?.data?.code === "token_not_valid"
            ) {
                setError("Authentication error. Please log in again.");
            } else {
                setError(
                    `Failed to load rooms for floor ${floorId}. Please try again later.`
                );
            }
        } finally {
            setLoading((prev) => ({ ...prev, rooms: false }));
        }
    };

    const fetchFilteredRooms = async (
        floorId: number | null | undefined,
        start: Date,
        end: Date
    ) => {
        // Clear existing rooms and selection
        setRooms([]);
        setSelectedRoom(null);

        setLoading((prev) => ({ ...prev, rooms: true }));
        setError(null);

        // validate time range
        if (start >= end) {
          setError("End time must be after start time");
          setLoading((prev) => ({ ...prev, rooms: false }));
          return;
        }

        try {
            // console.log(`Fetching rooms for floor ${floorId}...`);
            const data = await getFilteredRooms(floorId, start, end);
            // console.log(`Rooms fetched for floor ${floorId}:`, data);

            setRooms(data);
        } catch (err: any) {
            console.error(`Error fetching rooms for floor ${floorId}:`, err);

            if (err.message === "End time must be after start time") {
                setError("Please select an end time that is after the start time");
            }
            // Check if error is related to authentication
            else if (
                err?.response?.status === 401 ||
                err?.response?.data?.code === "token_not_valid"
            ) {
                setError("Authentication error. Please log in again.");
            } 
            else {
                setError(
                    `Failed to load rooms for floor ${floorId}. Please try again later.`
                );
            }
        } finally {
            setLoading((prev) => ({ ...prev, rooms: false }));
        }
    };

    const fetchMaterials = async (libraryId: number) => {
        setMaterials([]);
        setLoading((prev) => ({ ...prev, materials: true }));

        try {
            // console.log(`Fetching materials for library ${libraryId}...`);
            const data = await getLibraryMaterials(libraryId);
            // console.log("Materials fetched:", data);
            setMaterials(data);
        } catch (err: any) {
            console.error(
                `Error fetching materials for library ${libraryId}:`,
                err
            );
            setError(`Failed to load materials for library ${libraryId}.`);
        } finally {
            setLoading((prev) => ({ ...prev, materials: false }));
        }
    };

    const selectLibrary = (library: Library | null) => {
        // console.log("Selecting library:", library?.id, library?.name);
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
        // console.log("Selecting floor:", floor?.id, floor?.number);
        // Only update if different from current selection
        if (floor?.id !== selectedFloor?.id) {
            setSelectedFloor(floor);
            // Reset room selection when floor changes
            setSelectedRoom(null);
            setRooms([]);
        }
    };

    const selectRoom = (room: Room | null) => {
        // console.log("Selecting room:", room?.room_id);
        setSelectedRoom(room);
    };

    /**
     * Fetches detailed information for a specific room by its room_id
     * first checks if the room is already in state before making an API request
     * Implements fallback mechanisms for URL routing inconsistencies, these will
     * ideally be removed. I am new to Axios and had problems with URLs having /api/
     * prepended to all requests.
     *
     * @param {string} roomId - The unique identifier for the room
     * @returns {Promise<Room | null>} Room data or null if not found
     */
    const getRoomById = async (roomId: string): Promise<Room | null> => {
        // cache check logic
        if (selectedRoom?.room_id === roomId) {
            return selectedRoom;
        }

        const existingRoom = rooms.find((room) => room.room_id === roomId);
        if (existingRoom) {
            return existingRoom;
        }

        // track whether we should update state ( for component unmounting )
        let shouldUpdateState = true;

        // set loading state once
        setLoading((prev) => ({ ...prev, singleRoom: true }));

        try {
            // console.log( `Attempting to fetch room ${roomId}` );

            // try the normal API path first
            try {
                const response = await api.get(`/rooms/rooms/${roomId}/`);

                // if we got here, the request was successful
                //   console.log( `Successfully fetched room ${roomId}`, response.data );

                // update loading state before returning result
                if (shouldUpdateState) {
                    setLoading((prev) => ({ ...prev, singleRoom: false }));
                }

                return response.data;
            } catch (requestError) {
                // safely handle all possible error types
                console.error(
                    `Request error for room ${roomId}:`,
                    requestError
                );
                throw requestError; // re-throw to be caught by outer catch block
            }
        } catch (err) {
            // safely handle all error types without accessing potentially undefined properties
            console.error(`Error fetching room ${roomId}:`, err);

            // set a generic error message
            if (shouldUpdateState) {
                setError(
                    `Unable to load room ${roomId}. Please try again later.`
                );
                setLoading((prev) => ({ ...prev, singleRoom: false }));
            }

            return null;
        }
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
                selectedStartTime,
                selectedEndTime,
                error,
                selectLibrary,
                selectFloor,
                selectRoom,
                setStartTime,
                setEndTime,
                refreshLibraries,
                getRoomById,
            }}
        >
            {children}
        </LibraryContext.Provider>
    );
};

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error("useLibrary must be used within a LibraryProvider");
    }
    return context;
};
