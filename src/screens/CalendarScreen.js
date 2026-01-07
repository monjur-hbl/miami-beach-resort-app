// Miami Beach Resort - Calendar Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchBookings } from '../services/api';
import { Config, getRoomInfo } from '../constants/config';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const CELL_WIDTH = 45;
const ROOM_COLUMN_WIDTH = 60;

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());

  const DAYS_TO_SHOW = 14;

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate dates array
  const dates = [];
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatDay = (date) => date.getDate();
  const formatWeekday = (date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const formatMonth = (date) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];

  const isToday = (date) => formatDate(date) === formatDate(new Date());

  // Get all room units
  const allUnits = [];
  Config.ROOMS.forEach(room => {
    for (let u = 1; u <= room.units; u++) {
      const num = Config.ROOM_NUMBERS[room.id]?.[u] || `${room.id}-${u}`;
      allUnits.push({ roomId: room.id, unitId: u, num, roomName: room.short });
    }
  });
  allUnits.sort((a, b) => a.num - b.num);

  // Check if a unit is booked on a date
  const getBookingForCell = (roomId, unitId, date) => {
    const dateStr = formatDate(date);
    return bookings.find(b => 
      b.roomId === roomId && 
      b.unitId === unitId && 
      b.arrival <= dateStr && 
      b.departure > dateStr
    );
  };

  // Navigate weeks
  const goToPrevWeek = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate);
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.navButton} onPress={goToPrevWeek}>
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {formatMonth(startDate)} {startDate.getFullYear()}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header Row - Dates */}
          <View style={styles.headerRow}>
            <View style={[styles.roomColumn, styles.headerCell]}>
              <Text style={styles.headerText}>Room</Text>
            </View>
            {dates.map((date, i) => (
              <View
                key={i}
                style={[
                  styles.dateCell,
                  styles.headerCell,
                  isToday(date) && styles.todayHeader,
                ]}
              >
                <Text style={[styles.weekday, isToday(date) && styles.todayText]}>
                  {formatWeekday(date)}
                </Text>
                <Text style={[styles.day, isToday(date) && styles.todayText]}>
                  {formatDay(date)}
                </Text>
              </View>
            ))}
          </View>

          {/* Room Rows */}
          <ScrollView style={styles.gridBody}>
            {allUnits.map((unit, rowIndex) => (
              <View key={`${unit.roomId}-${unit.unitId}`} style={styles.row}>
                <View style={styles.roomColumn}>
                  <Text style={styles.roomNumber}>{unit.num}</Text>
                  <Text style={styles.roomType}>{unit.roomName}</Text>
                </View>
                {dates.map((date, colIndex) => {
                  const booking = getBookingForCell(unit.roomId, unit.unitId, date);
                  const isCheckIn = booking && booking.arrival === formatDate(date);
                  const isCheckOut = booking && booking.departure === formatDate(new Date(date.getTime() + 86400000));
                  
                  return (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.cell,
                        isToday(date) && styles.todayColumn,
                        booking && styles.bookedCell,
                        isCheckIn && styles.checkInCell,
                      ]}
                      onPress={() => {
                        if (booking) {
                          navigation.navigate('BookingDetail', { booking, bookings });
                        }
                      }}
                    >
                      {booking && isCheckIn && (
                        <Text style={styles.guestName} numberOfLines={1}>
                          {booking.firstName?.substring(0, 6)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.teal }]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.gold }]} />
          <Text style={styles.legendText}>Check-in</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.gold }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    color: Colors.teal,
    fontWeight: '600',
  },
  todayButton: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  todayButtonText: {
    color: Colors.darkSlate,
    fontWeight: 'bold',
    fontSize: 12,
  },
  monthYear: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    backgroundColor: Colors.darker,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  roomColumn: {
    width: ROOM_COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: 8,
  },
  dateCell: {
    width: CELL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  todayHeader: {
    backgroundColor: Colors.goldLight,
  },
  weekday: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  day: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  todayText: {
    color: Colors.gold,
  },
  gridBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roomNumber: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  roomType: {
    color: Colors.textMuted,
    fontSize: 9,
  },
  cell: {
    width: CELL_WIDTH,
    height: 45,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayColumn: {
    backgroundColor: 'rgba(212, 168, 83, 0.1)',
  },
  bookedCell: {
    backgroundColor: Colors.teal,
  },
  checkInCell: {
    backgroundColor: Colors.gold,
  },
  guestName: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});

export default CalendarScreen;
