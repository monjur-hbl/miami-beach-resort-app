// Miami Beach Resort - API Services

import { Config } from '../constants/config';

// Fetch all bookings from Beds24 proxy
export const fetchBookings = async () => {
  try {
    const response = await fetch(`${Config.BEDS24_PROXY}/getBookings`);
    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await fetch(`${Config.BEDS24_PROXY}?endpoint=bookings&action=write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Array.isArray(bookingData) ? bookingData : [bookingData]),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update a booking
export const updateBooking = async (bookingId, updates) => {
  try {
    const response = await fetch(`${Config.BEDS24_PROXY}?endpoint=bookings&action=write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: bookingId, ...updates }]),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

// Fetch housekeeping tasks
export const fetchHKTasks = async () => {
  try {
    const response = await fetch(`${Config.HK_API}/tasks`);
    const data = await response.json();
    return data.tasks || data || [];
  } catch (error) {
    console.error('Error fetching HK tasks:', error);
    throw error;
  }
};

// Create housekeeping task
export const createHKTask = async (taskData) => {
  try {
    const response = await fetch(`${Config.HK_API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating HK task:', error);
    throw error;
  }
};

// Update housekeeping task
export const updateHKTask = async (taskId, updates) => {
  try {
    const response = await fetch(`${Config.HK_API}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating HK task:', error);
    throw error;
  }
};

// Fetch room status from HK API
export const fetchRoomStatus = async () => {
  try {
    const response = await fetch(`${Config.HK_API}/room-status`);
    const data = await response.json();
    return data.status || data || {};
  } catch (error) {
    console.error('Error fetching room status:', error);
    return {};
  }
};

// Update room status
export const updateRoomStatus = async (roomId, unitId, status) => {
  try {
    const response = await fetch(`${Config.HK_API}/room-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, unitId, status }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating room status:', error);
    throw error;
  }
};

export default {
  fetchBookings,
  createBooking,
  updateBooking,
  fetchHKTasks,
  createHKTask,
  updateHKTask,
  fetchRoomStatus,
  updateRoomStatus,
};
