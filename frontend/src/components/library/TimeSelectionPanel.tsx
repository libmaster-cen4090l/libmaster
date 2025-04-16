// src/components/library/TimeSelectionPanel.tsx
import React from 'react';
import DatePicker from "react-datepicker";
import { Library } from '@/api/libraryService';
import { addDays } from '@/api/libraryService';

interface TimeSelectionPanelProps {
  selectedLibrary: Library | null;
  selectedStartTime: Date | null;
  selectedEndTime: Date | null;
  setStartTime: (date: Date | null) => void;
  setEndTime: (date: Date | null) => void;
}

const TimeSelectionPanel: React.FC<TimeSelectionPanelProps> = ({
  selectedLibrary,
  selectedStartTime,
  selectedEndTime,
  setStartTime,
  setEndTime
}) => {
  return (
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
    </div>
  );
};

export default TimeSelectionPanel;
