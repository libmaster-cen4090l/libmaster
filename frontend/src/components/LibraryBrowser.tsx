/**
 * LibraryBrowser Component
 *
 * Main interface for browsing libraries, floors, and rooms.
 * Allows users to select a library, view its floors, and
 * browse available rooms.
 *
 * Author(s): Zack Lima, Ivan Lepesii, Colby Leavitt, Dylan Connolly
 * Modified: 3/3/2025 @ 2:48:02 EST by Dylan
 *
 * MODIFICATIONS:
 * - Added navigation link to My Reservations page
 * - Incorporated the RecentReservations component for viewing recent bookings
 * - Enhanced header with improved navigation options
 * - Added conditional rendering based on authentication status
 *
 * @component
 * @requires React
 * @requires react-router-dom
 * @requires ../contexts/LibraryContext
 * @requires ../components/AuthProvider
 * @requires ./RecentReservations
 */

import React, { useEffect } from "react";
import { useLibrary } from "../contexts/LibraryContext";
import { useAuth } from "../contexts/AuthProvider";
import RecentReservations from "../components/RecentReservations";
import { Link, Navigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { addDays } from "@/api/libraryService";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
);

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
                <div className="flex gap-4">
                    <Link
                        to="/my-reservations"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                        My Reservations
                    </Link>
                    <button
                        onClick={() => refreshLibraries()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Refresh
                    </button>
                    <Link
                        to="/logout"
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* MAIN GRID for libraries, floors, rooms, materials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Libraries Column */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Libraries
                    </h2>

                    {loading.libraries ? (
                        <LoadingSpinner />
                    ) : (
                        <ul className="space-y-2">
                            {libraries.map((library) => (
                                <li
                                    key={library.id}
                                    className={`p-3 rounded-md cursor-pointer transition-colors duration-200
                                        ${
                                            selectedLibrary?.id === library.id
                                                ? "bg-blue-100 border-l-4 border-blue-500"
                                                : "hover:bg-gray-100"
                                        }`}
                                    onClick={() => selectLibrary(library)}
                                >
                                    <h3 className="font-medium">
                                        {library.name}
                                    </h3>
                                    {/* <p className="text-sm text-gray-600">
                                        {library.location}
                                    </p> */}
                                    <p className="text-xs text-gray-500">
                                        Hours:{" "}
                                        {formatTime(library.opening_time)} -{" "}
                                        {formatTime(library.closing_time)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {libraries.length === 0 && !loading.libraries && (
                        <p className="text-gray-500 text-center py-4">
                            No libraries available.
                        </p>
                    )}
                </div>

                {/* Floors Column */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        {selectedLibrary
                            ? `Floors - ${selectedLibrary.name}`
                            : "Select a Library"}
                    </h2>

                    {!selectedLibrary && !loading.floors && (
                        <p className="text-gray-500 text-center py-4">
                            Please select a library first
                        </p>
                    )}

                    {loading.floors ? (
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
                                    onClick={() => selectFloor(floor)}
                                >
                                    <h3 className="font-medium">
                                        Floor {floor.number}
                                    </h3>
                                    {floor.description && (
                                        <p className="text-sm text-gray-600">
                                            {floor.description}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Time Picker Column */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">
                        Reservation Time
                    </h2>

                    {!selectedLibrary ? (
                        <p className="text-gray-500 text-center py-2">
                            Please select a library first
                        </p>
                    ) : (
                        <div className="flex gap-2">
                            <DatePicker
                                selected={selectedStartTime}
                                onChange={(date) => {
                                    setStartTime(date);
                                    if (
                                        (date &&
                                            selectedEndTime &&
                                            date > selectedEndTime) ||
                                        !selectedEndTime
                                    ) {
                                        setEndTime(date);
                                    }
                                }}
                                showTimeSelect
                                timeIntervals={5}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                wrapperClassName="w-full"
                                className="block w-full space-y-2 p-2 rounded-lg shadow"
                                required
                                includeDateIntervals={[
                                    {
                                        start: addDays(new Date(), -1),
                                        end: addDays(new Date(), 7),
                                    },
                                ]}
                                placeholderText="Start Time"
                            />
                            <DatePicker
                                selected={selectedEndTime}
                                onChange={(date) => {
                                    setEndTime(date);
                                    if (
                                        selectedStartTime &&
                                        date &&
                                        selectedStartTime > date
                                    )
                                        setStartTime(date);
                                }}
                                showTimeSelect
                                timeIntervals={5}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                wrapperClassName="w-full"
                                className="block w-full space-y-2 p-2 rounded-lg shadow"
                                required
                                includeDateIntervals={[
                                    {
                                        start: addDays(new Date(), -1),
                                        end: addDays(new Date(), 7),
                                    },
                                ]}
                                placeholderText="End Time"
                            />
                        </div>
                    )}

                    {floors.length === 0 &&
                        selectedLibrary &&
                        !loading.floors && (
                            <p className="text-gray-500 text-center py-4">
                                No floors available for this library.
                            </p>
                        )}
                </div>

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
                                <li
                                    key={room.room_id}
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
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        Whiteboard
                                                    </span>
                                                )}
                                                {room.has_monitor && (
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                        Monitor
                                                    </span>
                                                )}
                                                {room.has_window && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                        Window
                                                    </span>
                                                )}
                                                {room.is_graduate_only && (
                                                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                                        Grad Only
                                                    </span>
                                                )}
                                                {room.requires_admin_approval && (
                                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                                        Approval Req.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full
                                    ${
                                        room.status === "available"
                                            ? "bg-green-100 text-green-800"
                                            : room.status === "maintenance"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                            >
                                                {room.status}
                                            </span>

                                            {room.status === "available" && (
                                                <div className="mt-2">
                                                    <Link
                                                        to={`/reserve/${room.room_id}`}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md block text-center transition-colors duration-200"
                                                    >
                                                        Reserve
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {rooms.length === 0 && selectedFloor && !loading.rooms && (
                        <p className="text-gray-500 text-center py-4">
                            No rooms available on this floor.
                        </p>
                    )}
                </div>
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
