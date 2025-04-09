// Author(s): Dylan Connolly
// Purpose: Creates a reusable component for Reservation Forms on FE
// Modified: 3/2/2025

/**
 * ReservationForm Component
 *
 * Form component that allows users to create new room reservations.
 * Displays fields for reservation details (date/time, purpose, attendees),
 * validates user inputs, and submits the reservation request to the API.
 *
 * @component
 * @requires React
 * @requires react-router-dom
 * @requires ../api/libraryService
 *
 * @param {Object} props - Component props
 * @param {Room} props.room - Room object containing details of the room being reserved
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { createReservation, Room } from "../../api/libraryService";
import { useAuth } from "../../contexts/AuthProvider";
import "react-datepicker/dist/react-datepicker.css";

interface ReservationFormProps {
    room: Room;
    initialStartTime?: Date | null;
    initialEndTime?: Date | null;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ 
    room,
    initialStartTime,
    initialEndTime
}) => {

    const navigate = useNavigate();

    // state for form data, loading status, and error messages
    // -- Modified state to use Date objects instead of strings
    const [formData, setFormData] = useState({
        start_time: initialStartTime || null as Date | null,
        end_time: initialEndTime || null as Date | null,
        purpose: "",
        num_attendees: 1,
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Updates form data state when input fields change
     * Handles conversion of number inputs from string to integer
     *
     * Sorry about the long function header...
     *
     * @param {ChangeEvent} e - Form input change change event
     */
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "num_attendees" ? parseInt(value) : value,
        }));
    };

    /**
     * Handles date changes for react-datepicker
     *
     */
    const handleDateChange = (
        date: Date | null,
        field: "start_time" | "end_time"
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: date,
        }));
    };

    /**
     * Format dates for API submission
     */
    const formatDateForAPI = (date: Date | null): string => {
        if (!date) return "";
        return date.toISOString();
    };

    /**
     * Handles form submission to create a new reservation
     * Validates inputs and calls the createReservation API function
     *
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = async (
        e: React.FormEvent<EventTarget>
    ): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // call API to create the reservation
            const reservation = await createReservation({
                room_id: room.room_id,
                start_time: formatDateForAPI(formData.start_time),
                end_time: formatDateForAPI(formData.end_time),
                purpose: formData.purpose,
                num_attendees: formData.num_attendees,
                notes: formData.notes,
            });

            if (reservation) {
                // redirect to My Reservations page on success
                navigate("/my-reservations");
            }
        } catch (err: any) {
            //show detailed error messages
            if (err.response && err.response.data) {
                const messages = Object.values(err.response.data)
                    .flat()
                    .join("\n");
                setError(`Unable to create reservation:\n${messages}`);
            } else {
                setError("Error creating reservation");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // render the reservation form with inputs for date/time, purpose, attendees
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            {/* form content */}
            <h2 className="text-xl font-bold mb-4">
                Reserve Room {room.room_id}
            </h2>
            {room.requires_admin_approval && (
                <div className="bg-amber-50 border-1-4 border-amber-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-amber-700">
                                This room requires administrator approval. Your
                                reservation will be pending until approved by
                                library staff.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {room.is_graduate_only && (
                <div className="bg-indigo-50 border-1-4 border-indigo-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-indigo-700">
                                This room is reserved for graduate students
                                only.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <pre className="whitespace-pre-wrap">{error}</pre>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Date and Time
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600">
                                Start Time
                            </label>
                            <DatePicker
                                selected={formData.start_time}
                                onChange={(date) =>
                                    handleDateChange(date, "start_time")
                                }
                                showTimeSelect
                                timeIntervals={5}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full p-2 border rounded"
                                required
                                placeholderText="Select start date and time"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">
                                End Time
                            </label>
                            <DatePicker
                                selected={formData.end_time}
                                onChange={(date) =>
                                    handleDateChange(date, "end_time")
                                }
                                showTimeSelect
                                timeIntervals={5}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full p-2 border rounded"
                                required
                                placeholderText="Select end date and time"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Purpose
                    </label>
                    <input
                        type="text"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        placeholder="Study session, meeting, etc."
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Number of Attendees (Max: {room.capacity})
                    </label>
                    <input
                        type="number"
                        name="num_attendees"
                        value={formData.num_attendees}
                        onChange={handleChange}
                        min="1"
                        max={room.capacity}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        rows={3}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            window.history.back();
                        }}
                        className="mr-2 px-4 py-2 text-gray-600 rounded border"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? "Submitting..." : "Reserve Room"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReservationForm;
