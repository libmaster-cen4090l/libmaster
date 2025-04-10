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
 */

import React, { useEffect } from "react";
import { useLibrary } from "../../contexts/LibraryContext";
import { useAuth } from "../../contexts/AuthProvider";
import RecentReservations from "../reservations/RecentReservations";
import { Link, Navigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { addDays } from "@/api/libraryService";
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import AmenityTag from '../common/AmenityTag';
import ErrorDisplay from '../common/ErrorDisplay';
import LibrarySelectionPanel from './LibrarySelectionPanel';

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
                                    className={`p-3 rounded-md h- cursor-pointer transition-colors duration-200 
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
                                        <p className="text-xs text-gray-500">
                                            {floor.description}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* End Floors Column */}
                {/* Time Picker Column */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Reservation Time
                    </h2>

                    {!selectedLibrary ? (
                        <p className="text-gray-500 text-center py-2">
                            Please select a library first
                        </p>
                    ) : (
                        <div>
                            <div className="flex w-full">
                                <DatePicker
                                    selected={selectedStartTime}
                                    onChange={(date) => {
                                        setStartTime(date);
                                        if (date) {
                                          if (!selectedEndTime || selectedEndTime <= date) {
                                            const newEndTime = new Date(date);
                                            newEndTime.setMinutes(date.getMinutes() + 30);
                                            setEndTime(newEndTime);
                                          }
                                        }
                                    }}
                                    showTimeSelect
                                    timeIntervals={5}
                                    dateFormat="MMMM d, h:mm aa"
                                    wrapperClassName=""
                                    className="text-center w-full border-blue-300 select-none border-4 border-r-0 flex p-2 rounded-r-none rounded-lg"
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
                                    dateFormat="MMMM d, h:mm aa"
                                    wrapperClassName=""
                                    className="block border-blue-300 w-full border-4 select-none text-center rounded-l-none p-2 rounded-lg"
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
                            <div className="mt-2 text-right">
                                <button
                                    onClick={() => {
                                        setStartTime(null);
                                        setEndTime(null);
                                    }}
                                    className="text-sm text-blue-500 hover:text-blue-700"
                                >
                                    Clear Time Selection
                                </button>
                            </div>
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
                                                {room.has_whiteboard && <AmenityTag type="whiteboard" className="text-xs" />}
                                                {room.has_monitor && <AmenityTag type="monitor" className="text-xs" />}
                                                {room.has_window && <AmenityTag type="window" className="text-xs" />}
                                                {room.is_graduate_only && <AmenityTag type="grad_only" className="text-xs" />}
                                                {room.requires_admin_approval && <AmenityTag type="approval_req" className="text-xs" />}
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
