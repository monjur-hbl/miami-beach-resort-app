// Miami Beach Resort - Today Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchBookings } from '../services/api';
import { getRoomInfo } from '../constants/config';
import Colors from '../constants/colors';

const TodayScreen = () => {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('checkin');

  const today = new Date().toISOString().split('T')[0];

  const loadBookings = async () => {
    try {
      const data = await fetchBookings();
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

  // Filter bookings
  const checkIns = bookings.filter(b => b.arrival === today);
  const checkOuts = bookings.filter(b => b.departure === today);
  const inHouse = bookings.filter(b => b.arrival <= today && b.departure > today);

  const tabs = [
    { id: 'checkin', label: 'Check-In', count: checkIns.length, icon: '↓' },
    { id: 'checkout', label: 'Check-Out', count: checkOuts.length, icon: '↑' },
    { id: 'inhouse', label: 'In-House', count: inHouse.length, icon: '🏠' },
  ];

  const getActiveBookings = () => {
    switch (activeTab) {
      case 'checkin': return checkIns;
      case 'checkout': return checkOuts;
      case 'inhouse': return inHouse;
      default: return [];
    }
  };

  const renderBookingCard = (booking) => {
    const { room, num } = getRoomInfo(booking.roomId, booking.unitId);
    const price = parseFloat(booking.price) || 0;
    const paid = parseFloat(booking.deposit) || 0;
    const due = price - paid;

    return (
      <TouchableOpacity
        key={booking.id}
        style={styles.card}
        onPress={() => navigation.navigate('BookingDetail', { booking, bookings })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.roomBadge}>
            <Text style={styles.roomNumber}>{num}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.guestName}>
              {booking.firstName} {booking.lastName}
            </Text>
            <Text style={styles.roomType}>{room?.short || 'Room'}</Text>
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
          <Text style={styles.dates}>
            {booking.arrival} → {booking.departure}
          </Text>
          <Text style={styles.guests}>
            👤 {(parseInt(booking.numAdult) || 1) + (parseInt(booking.numChild) || 0)} guests
          </Text>
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
      {/* Stats Summary */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{checkIns.length}</Text>
          <Text style={styles.statLabel}>Arrivals</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{checkOuts.length}</Text>
          <Text style={styles.statLabel}>Departures</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inHouse.length}</Text>
          <Text style={styles.statLabel}>In-House</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            <View style={[styles.tabBadge, activeTab === tab.id && styles.tabBadgeActive]}>
              <Text style={styles.tabBadgeText}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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
        {getActiveBookings().length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No {activeTab} bookings for today</Text>
          </View>
        ) : (
          getActiveBookings().map(renderBookingCard)
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
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.teal,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.white,
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
  roomType: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dates: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  guests: {
    fontSize: 12,
    color: Colors.textSecondary,
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

export default TodayScreen;
