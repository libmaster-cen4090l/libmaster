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

// Interface for paginated response
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Safe error logging function
const logError = (message: string, error: any) => {
  console.error(message);
  
  // Safely log response data if available
  if (error && error.response) {
    console.log('Status:', error.response.status);
    if (error.response.data) {
      console.log('Response data:', error.response.data);
    }
  } else if (error instanceof Error) {
    console.log('Error:', error.message);
  }
};

// Get all libraries
export const getLibraries = async (): Promise<Library[]> => {
  try {
    const response = await api.get<PaginatedResponse<Library>>('/rooms/libraries/');
    console.log('Libraries API response:', response.data);
    
    // Handle paginated response - extract the results array
    if (response.data && response.data.results) {
      return response.data.results;
    }
    
    // Fallback for non-paginated response
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logError('Error fetching libraries', error);
    return [];
  }
};

// Get floors for a specific library
export const getLibraryFloors = async (libraryId: number): Promise<Floor[]> => {
  try {
    const response = await api.get<PaginatedResponse<Floor> | Floor[]>(`/rooms/floors/`, {
      params: { library: libraryId }
    });
    
    console.log(`Floors API response for library ${libraryId}:`, response.data);
    
    // Handle paginated response
    if (response.data && 'results' in response.data) {
      // Filter the results to only include floors with the correct library ID
      return response.data.results.filter(floor => floor.library === libraryId);
    }
    
    // Handle array response
    if (Array.isArray(response.data)) {
      // Filter the results to only include floors with the correct library ID
      return response.data.filter(floor => floor.library === libraryId);
    }
    
    return [];
  } catch (error) {
    logError(`Error fetching floors for library ${libraryId}`, error);
    return [];
  }
};

// Get rooms for a specific floor
export const getFloorRooms = async (floorId: number): Promise<Room[]> => {
  try {
    const response = await api.get<PaginatedResponse<Room> | Room[]>(`/rooms/rooms/`, {
      params: { floor: floorId }
    });
    
    console.log(`Rooms API response for floor ${floorId}:`, response.data);
    
    // Handle paginated response
    if (response.data && 'results' in response.data) {
      // Filter the results to only include rooms with the correct floor ID
      return response.data.results.filter(room => room.floor === floorId);
    }
    
    // Handle array response
    if (Array.isArray(response.data)) {
      // Filter the results to only include rooms with the correct floor ID
      return response.data.filter(room => room.floor === floorId);
    }
    
    return [];
  } catch (error) {
    logError(`Error fetching rooms for floor ${floorId}`, error);
    return [];
  }
};

// Get room availability for a specific date/time
export const getRoomAvailability = async (
  roomId: string,
  date: string
): Promise<{ available: boolean; reservations: Reservation[] } | null> => {
  try {
    const response = await api.get(`/rooms/rooms/${roomId}/availability/`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    logError(`Error fetching availability for room ${roomId}`, error);
    return null;
  }
};

// Create a reservation (requires authentication)
export const createReservation = async (reservationData: {
  room_id: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  num_attendees?: number;
  notes?: string;
}): Promise<Reservation | null> => {
  try {
    const response = await api.post('/rooms/reservations/', reservationData);
    return response.data;
  } catch (error) {
    logError('Error creating reservation', error);
    return null;
  }
};