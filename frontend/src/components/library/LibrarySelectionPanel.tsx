// src/components/library/LibrarySelectionPanel.tsx
import React from "react";
import { Library } from "@/api/libraryService";
import LoadingSpinner from "../common/LoadingSpinner";

interface LibrarySelectionPanelProps {
    libraries: Library[];
    selectedLibrary: Library | null;
    loading: boolean;
    onSelectLibrary: (library: Library) => void;
}

const LibrarySelectionPanel: React.FC<LibrarySelectionPanelProps> = ({
    libraries,
    selectedLibrary,
    loading,
    onSelectLibrary,
}) => {
    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${period}`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Choose a library
            </h2>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <ul className="space-y-2">
                    {libraries.map((library) => (
                        <li
                            key={library.id}
                            className={`p-3 h-16 rounded-md cursor-pointer transition-colors duration-200
                ${
                    selectedLibrary?.id === library.id
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "hover:bg-gray-100"
                }`}
                            onClick={() => onSelectLibrary(library)}
                        >
                            <h3 className="font-medium">{library.name}</h3>
                            <p className="text-xs text-gray-500">
                                Hours: {formatTime(library.opening_time)} -{" "}
                                {formatTime(library.closing_time)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {libraries.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-4">
                    No libraries available.
                </p>
            )}
        </div>
    );
};

export default LibrarySelectionPanel;
