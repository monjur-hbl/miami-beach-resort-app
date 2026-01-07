// Miami Beach Resort - Bookings Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchBookings } from '../services/api';
import { getRoomInfo } from '../constants/config';
import Colors from '../constants/colors';

const BookingsScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past, today

  const today = new Date().toISOString().split('T')[0];

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
      // Sort by arrival date descending
      data.sort((a, b) => new Date(b.arrival) - new Date(a.arrival));
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings();
  }, []);

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const guestName = `${booking.firstName} ${booking.lastName}`.toLowerCase();
      const roomNum = getRoomInfo(booking.roomId, booking.unitId).num.toString();
      const bookingId = booking.id.toString();
      
      if (!guestName.includes(query) && !roomNum.includes(query) && !bookingId.includes(query)) {
        return false;
      }
    }

    // Date filter
    switch (filter) {
      case 'today':
        return booking.arrival === today || booking.departure === today;
      case 'upcoming':
        return booking.arrival > today;
      case 'past':
        return booking.departure < today;
      default:
        return true;
    }
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
  ];

  const renderBookingCard = (booking) => {
    const { room, num } = getRoomInfo(booking.roomId, booking.unitId);
    const price = parseFloat(booking.price) || 0;
    const paid = parseFloat(booking.deposit) || 0;
    const due = price - paid;
    
    const isToday = booking.arrival === today || booking.departure === today;
    const isPast = booking.departure < today;

    return (
      <TouchableOpacity
        key={booking.id}
        style={[styles.card, isPast && styles.cardPast]}
        onPress={() => navigation.navigate('BookingDetail', { booking, bookings })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.roomBadge, isToday && styles.roomBadgeToday]}>
            <Text style={styles.roomNumber}>{num}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.guestName}>
              {booking.firstName} {booking.lastName}
            </Text>
            <Text style={styles.bookingId}>#{booking.id}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.price}>৳{price.toLocaleString()}</Text>
            {due > 0 ? (
              <Text style={styles.due}>Due: ৳{due.toLocaleString()}</Text>
            ) : (
              <Text style={styles.paid}>Paid ✓</Text>
            )}
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>In:</Text>
            <Text style={[styles.dateValue, booking.arrival === today && styles.dateToday]}>
              {booking.arrival}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Out:</Text>
            <Text style={[styles.dateValue, booking.departure === today && styles.dateToday]}>
              {booking.departure}
            </Text>
          </View>
          <Text style={styles.roomType}>{room?.short || 'Room'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, room, or booking ID..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterButton, filter === f.id && styles.filterButtonActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
      </Text>

      {/* Bookings List */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          filteredBookings.map(renderBookingCard)
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    marginBottom: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    color: Colors.white,
    fontSize: 15,
  },
  clearButton: {
    padding: 14,
  },
  clearButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  filters: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.white,
  },
  resultsCount: {
    paddingHorizontal: 15,
    marginBottom: 10,
    color: Colors.textMuted,
    fontSize: 12,
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPast: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomBadgeToday: {
    backgroundColor: Colors.gold,
  },
  roomNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  bookingId: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  due: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 3,
  },
  paid: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dateToday: {
    color: Colors.gold,
    fontWeight: 'bold',
  },
  roomType: {
    fontSize: 11,
    color: Colors.textMuted,
    backgroundColor: Colors.cardHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});

export default BookingsScreen;
