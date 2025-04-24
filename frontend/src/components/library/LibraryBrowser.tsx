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
 * @requires ../common/ErrorDisplay
 * @requires ./LibraryHeader
 * @requires ./LibrarySelectionPanel
 * @requires ./FloorSelectionPanel
 * @requires ./TimeSelectionPanel
 * @requires ./RoomsPanel
 * @requires ./MaterialsDisplay
 * @requires ./ReservationsSection
 */

// react dependencies
import React from "react";
import { Navigate } from "react-router-dom";

// contexts and APIs
import { useLibrary } from "../../contexts/LibraryContext";
import { useAuth } from "../../contexts/AuthProvider";
import { addDays } from "@/api/libraryService"; // not being used, will look into this after cleanup

// common components
import ErrorDisplay from "../common/ErrorDisplay";

// modular component dependencies
import LibraryHeader from "./LibraryHeader";
import LibrarySelectionPanel from "./LibrarySelectionPanel";
import FloorSelectionPanel from "./FloorSelectionPanel";
import TimeSelectionPanel from "./TimeSelectionPanel";
import RoomsPanel from "./RoomsPanel";
import MaterialsDisplay from "./MaterialsDisplay";
import ReservationsSection from "./ReservationsSection";

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

    return (
        <div className="container mx-auto px-4 py-6">
            {/* LibraryHeader, navigation links */}
            <LibraryHeader
                title="Library Study Rooms"
                onRefresh={refreshLibraries}
            />

            {/* ErrorDisplay devoted space */}
            {error && <ErrorDisplay message={error} className="mb-4" />}

            {/* MAIN GRID for Libraries, Floors, Rooms, Materials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Libraries Column */}
                <LibrarySelectionPanel
                    libraries={libraries}
                    selectedLibrary={selectedLibrary}
                    loading={loading.libraries}
                    onSelectLibrary={selectLibrary}
                />

                {/* Recent Reservations Section */}
                <ReservationsSection
                    isAuthenticated={isAuthenticated}
                    numberOfReservations={2}
                />

                {/* Materials Display */}
                <MaterialsDisplay
                    selectedLibrary={selectedLibrary}
                    materials={materials}
                    loading={loading.materials}
                />

                {/* Time Picker Column */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <TimeSelectionPanel
                            selectedLibrary={selectedLibrary}
                            selectedStartTime={selectedStartTime}
                            selectedEndTime={selectedEndTime}
                            setStartTime={setStartTime}
                            setEndTime={setEndTime}
                        />
                    </div>
                    <FloorSelectionPanel
                        floors={floors}
                        selectedLibrary={selectedLibrary}
                        selectedFloor={selectedFloor}
                        loading={loading.floors}
                        selectFloor={selectFloor}
                    />
                </div>

                {/* Rooms Column */}
                <RoomsPanel
                    rooms={rooms}
                    selectedFloor={selectedFloor}
                    loading={loading.rooms}
                />

                {/* End Main Grid */}
            </div>

            {/* Floors Column */}
        </div>
    );
};

export default LibraryBrowser;
