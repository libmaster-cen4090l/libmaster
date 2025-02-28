import api from './axiosInstance';

export interface Library {
  id: number;
  name: string;
  location: string;
  description: string;
  opening_time: string;
  closing_time: string;
}

export interface Floor {
  id: number;
  library: number;
  number: number;
  description: string;
  floor_map?: any;
}

export interface Room {
  room_id: string;
  floor: number;
  capacity: number;
  has_whiteboard: boolean;
  has_monitor: boolean;
  has_window: boolean;
  status: 'available' | 'maintenance' | 'closed';
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
}

export interface Reservation {
  reservation_id: string;
  room: string;
  start_time: string;
  end_time: string;
  status: string;
  purpose: string;
  num_attendees: number;
}

// Get all libraries
export const getLibraries = async (): Promise<Library[]> => {
  const response = await api.get('/rooms/libraries/');
  return response.data;
};

// Get floors for a specific library
export const getLibraryFloors = async (libraryId: number): Promise<Floor[]> => {
  const response = await api.get(`/rooms/libraries/${libraryId}/floors/`);
  return response.data;
};

// Get rooms for a specific floor
export const getFloorRooms = async (floorId: number): Promise<Room[]> => {
  const response = await api.get(`/rooms/floors/${floorId}/rooms/`);
  return response.data;
};

// Get room availability for a specific date/time
export const getRoomAvailability = async (
  roomId: string,
  date: string
): Promise<{ available: boolean; reservations: Reservation[] }> => {
  const response = await api.get(`/rooms/rooms/${roomId}/availability/`, {
    params: { date }
  });
  return response.data;
};

// Create a reservation (requires authentication)
export const createReservation = async (reservationData: {
  room_id: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  num_attendees?: number;
  notes?: string;
}): Promise<Reservation> => {
  const response = await api.post('/rooms/reservations/', reservationData);
  return response.data;
};