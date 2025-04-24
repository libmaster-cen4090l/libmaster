// src/components/library/FloorSelectionPanel.tsx
import React from "react";
import { Floor, Library } from "@/api/libraryService";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FloorSelectionPanelProps {
    floors: Floor[];
    selectedLibrary: Library | null;
    selectedFloor: Floor | null;
    loading: boolean;
    selectFloor: (floor: Floor) => void;
}

const FloorSelectionPanel: React.FC<FloorSelectionPanelProps> = ({
    floors,
    selectedLibrary,
    selectedFloor,
    loading,
    selectFloor: selectFloor,
}) => {
    return (
        <div>
            <Select
                onValueChange={(value: string) => {
                    const floor: Floor | undefined = floors.find(
                        (floor) => floor.id.toString() === value
                    );
                    if (floor) selectFloor(floor);
                }}
            >
                <SelectTrigger
                    disabled={selectedLibrary == null}
                    className="w-full h-full bg-white p-3 rounded-lg text-base shadow"
                >
                    <SelectValue placeholder="Select a floor" />
                </SelectTrigger>
                <SelectContent>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        floors.map((floor) => (
                            <SelectItem
                                value={floor.id.toString()}
                                className="text-base"
                            >
                                {`Floor ${floor.id}`}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default FloorSelectionPanel;
