/**
 * LibraryBrowser Component
 *
 * Main interface for browsing libraries, floors, and rooms.
 * Allows users to select a library, view its floors, and
 * browse available rooms.
 *
 * Author(s): Zack Lima, Ivan Lepesii, Colby Leavitt, Dylan Connolly
 * Modified: 4/9/2025 @ 20:38:47 EST by Dylan
 *
 * @component
 * @requires React
 * @requires react-router-dom
 * @requires ../../contexts/LibraryContext
 * @requires ../../contexts/AuthProvider
 * @requires ../reservations/RecentReservations
 * @requires react-datepicker
 * @requires ../common/LoadingSpinner
 * @requires ../common/StatusBadge
 * @requires ../common/AmenityTag
 * @requires ../common/ErrorDisplay
 * @requires ./LibrarySelectionPanel
 * @requires ./FloorSelectionPanel
 * @requires ./TimeSelectionPanel
 * @requires ./RoomCard
 */

// react dependencies
import React, { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import DatePicker from "react-datepicker";

// contexts and APIs
import { useLibrary } from "../../contexts/LibraryContext";
import { useAuth } from "../../contexts/AuthProvider";
import { addDays } from "@/api/libraryService";

// user-defined component dependencies
import RecentReservations from "../reservations/RecentReservations";
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import AmenityTag from '../common/AmenityTag';
import ErrorDisplay from '../common/ErrorDisplay';
import LibrarySelectionPanel from './LibrarySelectionPanel';
import FloorSelectionPanel from './FloorSelectionPanel';
import TimeSelectionPanel from './TimeSelectionPanel';
import RoomCard from './RoomCard';

const LibraryBrowser: React.FC = () => {
    const {
        libraries,
        selectedLibrary,
        floors,
        materials,
        selectedFloor,
        rooms,
        loading,
        selectedStartTime,
        selectedEndTime,
        error,
        selectLibrary,
        selectFloor,
        selectRoom,
        refreshLibraries,
        setStartTime,
        setEndTime,
    } = useLibrary();

    const auth = useAuth();
    const isAuthenticated = !!auth.token;

    // Redirect to login if not authenticated
    if (auth.token === null) {
        return <Navigate to="/login" />;
    }

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/*header with navigation links */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Library Study Rooms
                </h1>
                <div className="flex max-h-10 gap-3">
                    <Link
                        to="/my-reservations"
                        className="bg-emerald-400 text-center shadow hover:bg-emerald-500 text-white px-4 max-h-10 min-w-40 transition-colors py-2 rounded-lg"
                    >
                        My Reservations
                    </Link>
                    <button
                        onClick={() => refreshLibraries()}
                        className="bg-blue-400 shadow hover:bg-blue-500 text-white px-4 transition-colors py-2 rounded-lg"
                    >
                        Refresh
                    </button>
                    <Link
                        to="/logout"
                        className="bg-gray-400 shadow hover:bg-slate-500 text-white px-4 transition-colors py-2 rounded-lg"
                    >
                        Logout
                    </Link>
                </div>
            </div>

            {error && <ErrorDisplay message={error} className="mb-4" />}

            {/* MAIN GRID for libraries, floors, rooms, materials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Libraries Column */}
                <LibrarySelectionPanel
                    libraries={libraries}
                    selectedLibrary={selectedLibrary}
                    loading={loading.libraries}
                    onSelectLibrary={selectLibrary}
                />
                {/* End Libraries Column */}
                {/* Floors Column */}
                <FloorSelectionPanel
                    floors={floors}
                    selectedLibrary={selectedLibrary}
                    selectedFloor={selectedFloor}
                    loading={loading.floors}
                    onSelectFloor={selectFloor}
                />
                {/* End Floors Column */}
                {/* Time Picker Column */}
                <TimeSelectionPanel
                    selectedLibrary={selectedLibrary}
                    selectedStartTime={selectedStartTime}
                    selectedEndTime={selectedEndTime}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                />
                {/* End Time Picker Column */}
                {/* Rooms Column */}
                <div className="bg-white p-6 col-span-3 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        {selectedFloor
                            ? `Rooms - Floor ${selectedFloor.number}`
                            : "Select a Floor"}
                    </h2>

                    {!selectedFloor && !loading.rooms && (
                        <p className="text-gray-500 text-center py-4">
                            Please select a floor first
                        </p>
                    )}

                    {loading.rooms ? (
                        <LoadingSpinner />
                    ) : (
                        <ul className="space-y-2">
                            {rooms.map((room) => (
                                <RoomCard key={room.room_id} room={room} />
                            ))}
                        </ul>
                    )}

                    {rooms.length === 0 && selectedFloor && !loading.rooms && (
                        <p className="text-gray-500 text-center py-4">
                            No rooms available on this floor.
                        </p>
                    )}
                </div>
                {/* End Rooms Column */}
                {/* End Main Grid */}
            </div>
            {/* After main grid */}
            {/* ADDED: Recent reservations section */}
            {/* Materials Column */}
            {selectedLibrary && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Available Materials at {selectedLibrary.name}
                    </h2>
                    {loading.materials ? (
                        <LoadingSpinner />
                    ) : materials.length > 0 ? (
                        <ul className="list-disc ml-6 mt-2">
                            {materials.map((material) => (
                                <li key={material.id} className="text-gray-700">
                                    {material.name
                                        .replace("_", " ")
                                        .toUpperCase()}{" "}
                                    {/* Format names */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 italic">
                            No materials available.
                        </p>
                    )}
                </div>
            )}
            {isAuthenticated && (
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
            )}
        </div>
    );
};

export default LibraryBrowser;
