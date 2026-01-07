// Miami Beach Resort - Housekeeping Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { fetchBookings, fetchRoomStatus, updateRoomStatus } from '../services/api';
import { Config, getRoomInfo } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

const HousekeepingScreen = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [roomStatus, setRoomStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const [bookingsData, statusData] = await Promise.all([
        fetchBookings(),
        fetchRoomStatus(),
      ]);
      setBookings(bookingsData);
      setRoomStatus(statusData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Get all room units with their status
  const getRoomUnits = () => {
    const units = [];
    Config.ROOMS.forEach(room => {
      for (let u = 1; u <= room.units; u++) {
        const num = Config.ROOM_NUMBERS[room.id]?.[u] || `${room.id}-${u}`;
        const key = `${room.id}-${u}`;
        
        // Check booking status
        const booking = bookings.find(b => 
          b.roomId === room.id && 
          b.unitId === u && 
          b.arrival <= today && 
          b.departure > today
        );
        
        const isCheckIn = bookings.some(b => 
          b.roomId === room.id && b.unitId === u && b.arrival === today
        );
        const isCheckOut = bookings.some(b => 
          b.roomId === room.id && b.unitId === u && b.departure === today
        );

        // Determine status
        let status = roomStatus[key] || 'vacant_clean';
        if (isCheckIn) status = 'checkin_today';
        else if (isCheckOut) status = 'checkout_today';
        else if (booking) status = 'occupied';

        units.push({
          roomId: room.id,
          unitId: u,
          num,
          roomName: room.short,
          status,
          booking,
          key,
        });
      }
    });
    return units.sort((a, b) => a.num - b.num);
  };

  const handleStatusChange = async (unit, newStatus) => {
    try {
      await updateRoomStatus(unit.roomId, unit.unitId, newStatus);
      setRoomStatus(prev => ({ ...prev, [unit.key]: newStatus }));
      setSelectedStatus(null);
      Alert.alert('Success', `Room ${unit.num} status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update room status');
    }
  };

  const getStatusConfig = (statusId) => {
    return Config.ROOM_STATUS.find(s => s.id === statusId) || Config.ROOM_STATUS[0];
  };

  const roomUnits = getRoomUnits();

  // Group by status for summary
  const statusCounts = {};
  roomUnits.forEach(u => {
    statusCounts[u.status] = (statusCounts[u.status] || 0) + 1;
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading housekeeping data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Summary */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summary}>
        {Config.ROOM_STATUS.map(status => (
          <View key={status.id} style={[styles.summaryCard, { borderColor: status.color }]}>
            <Text style={[styles.summaryCount, { color: status.color }]}>
              {statusCounts[status.id] || 0}
            </Text>
            <Text style={styles.summaryLabel}>{status.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Room Grid */}
      <ScrollView
        style={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
      >
        <View style={styles.roomsContainer}>
          {roomUnits.map(unit => {
            const statusConfig = getStatusConfig(unit.status);
            return (
              <TouchableOpacity
                key={unit.key}
                style={[styles.roomCard, { borderColor: statusConfig.color }]}
                onPress={() => setSelectedStatus(unit)}
              >
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                  <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
                </View>
                <Text style={styles.roomNum}>{unit.num}</Text>
                <Text style={styles.roomType}>{unit.roomName}</Text>
                {unit.booking && (
                  <Text style={styles.guestName} numberOfLines={1}>
                    {unit.booking.firstName}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Status Change Modal */}
      {selectedStatus && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Room {selectedStatus.num}</Text>
            <Text style={styles.modalSubtitle}>Select new status:</Text>
            
            <View style={styles.statusOptions}>
              {Config.ROOM_STATUS.map(status => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    { borderColor: status.color },
                    selectedStatus.status === status.id && styles.statusOptionActive,
                  ]}
                  onPress={() => handleStatusChange(selectedStatus, status.id)}
                >
                  <Text style={[styles.statusOptionIcon, { color: status.color }]}>
                    {status.icon}
                  </Text>
                  <Text style={styles.statusOptionLabel}>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedStatus(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkSlate,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.darkSlate,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 15,
  },
  summary: {
    maxHeight: 100,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  grid: {
    flex: 1,
    padding: 10,
  },
  roomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  roomCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    margin: '1%',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  statusBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 10,
    color: Colors.white,
  },
  roomNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  roomType: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  guestName: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.darkSlate,
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusOption: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  statusOptionActive: {
    backgroundColor: Colors.cardHover,
  },
  statusOptionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statusOptionLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default HousekeepingScreen;
