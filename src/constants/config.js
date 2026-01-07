// Miami Beach Resort - Configuration

export const Config = {
  // API Endpoints
  BEDS24_PROXY: 'https://beds24-proxy-1006186358018.us-central1.run.app',
  HK_API: 'https://hk-api-1006186358018.us-central1.run.app',
  
  // Property
  PROPERTY_ID: 279646,
  
  // App Info
  APP_NAME: 'Miami Beach Resort',
  VERSION: '1.0.0',
  
  // Room Types (from Beds24)
  ROOMS: [
    { id: 583466, name: '2 Bed Room Sea View', short: '2BR-SV', units: 2 },
    { id: 583467, name: '2 Bed Room Hill Side', short: '2BR-HS', units: 2 },
    { id: 583468, name: '3 Bed Room Sea View', short: '3BR-SV', units: 9 },
    { id: 583469, name: '3 Bed Room Pool View', short: '3BR-PV', units: 9 },
    { id: 583470, name: '3 Bed Room Hill Side', short: '3BR-HS', units: 4 },
    { id: 583471, name: 'Duplex - 3 Bed Room', short: 'DPX-3BR', units: 8 },
    { id: 583472, name: 'Duplex - 4 Bed Room', short: 'DPX-4BR', units: 4 },
  ],
  
  // Room Number Mapping
  ROOM_NUMBERS: {
    583466: { 1: 201, 2: 202 },
    583467: { 1: 301, 2: 302 },
    583468: { 1: 303, 2: 304, 3: 305, 4: 306, 5: 307, 6: 401, 7: 402, 8: 403, 9: 404 },
    583469: { 1: 101, 2: 102, 3: 103, 4: 104, 5: 105, 6: 106, 7: 107, 8: 108, 9: 109 },
    583470: { 1: 405, 2: 406, 3: 407, 4: 408 },
    583471: { 1: 501, 2: 502, 3: 503, 4: 504, 5: 505, 6: 506, 7: 507, 8: 508 },
    583472: { 1: 601, 2: 602, 3: 603, 4: 604 },
  },
  
  // User Roles
  ROLES: {
    admin: { label: 'Admin', color: '#D4A853' },
    front_desk: { label: 'Front Desk', color: '#2D6A6A' },
    accounting: { label: 'Accounting', color: '#8b5cf6' },
    hk_manager: { label: 'HK Manager', color: '#f59e0b' },
    hk_team: { label: 'HK Team', color: '#22c55e' },
  },
  
  // Room Status Options
  ROOM_STATUS: [
    { id: 'vacant_clean', label: 'Vacant Clean', color: '#22c55e', icon: '✓' },
    { id: 'vacant_dirty', label: 'Vacant Dirty', color: '#f59e0b', icon: '!' },
    { id: 'occupied', label: 'Occupied', color: '#3b82f6', icon: '●' },
    { id: 'checkout_today', label: 'Checkout Today', color: '#8b5cf6', icon: '↑' },
    { id: 'checkin_today', label: 'Checkin Today', color: '#06b6d4', icon: '↓' },
    { id: 'maintenance', label: 'Maintenance', color: '#ef4444', icon: '⚠' },
    { id: 'blocked', label: 'Blocked', color: '#6b7280', icon: '✕' },
    { id: 'inspected', label: 'Inspected', color: '#10b981', icon: '★' },
  ],
  
  // Payment Methods
  PAYMENT_METHODS: [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'bkash', label: 'bKash/MFS', icon: '📱' },
    { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
    { id: 'card', label: 'Card', icon: '💳' },
  ],
};

// Helper function to get room number
export const getRoomNumber = (roomId, unitId) => {
  return Config.ROOM_NUMBERS[roomId]?.[unitId] || `${roomId}-${unitId}`;
};

// Helper function to get room info
export const getRoomInfo = (roomId, unitId) => {
  const room = Config.ROOMS.find(r => r.id === roomId);
  const num = getRoomNumber(roomId, unitId);
  return { room, num };
};

export default Config;
