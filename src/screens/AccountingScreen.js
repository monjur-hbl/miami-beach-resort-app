// Miami Beach Resort - Accounting Screen

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
import { fetchBookings } from '../services/api';
import { getRoomInfo } from '../constants/config';
import Colors from '../constants/colors';

const AccountingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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

  // Get month start and end
  const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  const monthEndStr = monthEnd.toISOString().split('T')[0];

  // Filter bookings for selected month
  const monthBookings = bookings.filter(b => {
    return b.arrival >= monthStartStr && b.arrival <= monthEndStr;
  });

  // Calculate totals
  const totalRevenue = monthBookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
  const totalPaid = monthBookings.reduce((sum, b) => sum + (parseFloat(b.deposit) || 0), 0);
  const totalDue = totalRevenue - totalPaid;
  const totalBookings = monthBookings.length;

  // Group by payment status
  const fullyPaid = monthBookings.filter(b => (parseFloat(b.deposit) || 0) >= (parseFloat(b.price) || 0));
  const partiallyPaid = monthBookings.filter(b => {
    const paid = parseFloat(b.deposit) || 0;
    const price = parseFloat(b.price) || 0;
    return paid > 0 && paid < price;
  });
  const unpaid = monthBookings.filter(b => (parseFloat(b.deposit) || 0) === 0);

  // Navigate months
  const goToPrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const formatMonth = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading accounting data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{formatMonth(selectedMonth)}</Text>
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.revenueCard]}>
            <Text style={styles.cardLabel}>Total Revenue</Text>
            <Text style={styles.cardValue}>৳{totalRevenue.toLocaleString()}</Text>
            <Text style={styles.cardSubtext}>{totalBookings} bookings</Text>
          </View>
          
          <View style={[styles.summaryCard, styles.paidCard]}>
            <Text style={styles.cardLabel}>Collected</Text>
            <Text style={[styles.cardValue, { color: Colors.success }]}>
              ৳{totalPaid.toLocaleString()}
            </Text>
            <Text style={styles.cardSubtext}>
              {totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0}% collected
            </Text>
          </View>
          
          <View style={[styles.summaryCard, styles.dueCard]}>
            <Text style={styles.cardLabel}>Outstanding</Text>
            <Text style={[styles.cardValue, { color: totalDue > 0 ? Colors.error : Colors.success }]}>
              ৳{totalDue.toLocaleString()}
            </Text>
            <Text style={styles.cardSubtext}>
              {partiallyPaid.length + unpaid.length} pending
            </Text>
          </View>
        </View>

        {/* Payment Status Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Status</Text>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.statusLabel}>Fully Paid</Text>
            <Text style={styles.statusCount}>{fullyPaid.length}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.statusLabel}>Partially Paid</Text>
            <Text style={styles.statusCount}>{partiallyPaid.length}</Text>
          </View>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.statusLabel}>Unpaid</Text>
            <Text style={styles.statusCount}>{unpaid.length}</Text>
          </View>
        </View>

        {/* Outstanding Payments List */}
        {totalDue > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outstanding Payments</Text>
            
            {[...partiallyPaid, ...unpaid]
              .sort((a, b) => (parseFloat(b.price) - parseFloat(b.deposit)) - (parseFloat(a.price) - parseFloat(a.deposit)))
              .slice(0, 10)
              .map(booking => {
                const { num } = getRoomInfo(booking.roomId, booking.unitId);
                const price = parseFloat(booking.price) || 0;
                const paid = parseFloat(booking.deposit) || 0;
                const due = price - paid;
                
                return (
                  <View key={booking.id} style={styles.outstandingItem}>
                    <View style={styles.outstandingLeft}>
                      <Text style={styles.outstandingRoom}>{num}</Text>
                      <View>
                        <Text style={styles.outstandingGuest}>
                          {booking.firstName} {booking.lastName}
                        </Text>
                        <Text style={styles.outstandingDate}>{booking.arrival}</Text>
                      </View>
                    </View>
                    <View style={styles.outstandingRight}>
                      <Text style={styles.outstandingDue}>৳{due.toLocaleString()}</Text>
                      <Text style={styles.outstandingTotal}>of ৳{price.toLocaleString()}</Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* Daily Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Arrivals</Text>
          
          {Array.from({ length: monthEnd.getDate() }, (_, i) => {
            const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1);
            const dateStr = date.toISOString().split('T')[0];
            const dayBookings = monthBookings.filter(b => b.arrival === dateStr);
            const dayRevenue = dayBookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
            
            if (dayBookings.length === 0) return null;
            
            return (
              <View key={i} style={styles.dailyRow}>
                <Text style={styles.dailyDate}>{i + 1}</Text>
                <View style={styles.dailyBar}>
                  <View
                    style={[
                      styles.dailyBarFill,
                      { width: `${Math.min((dayRevenue / (totalRevenue || 1)) * 100 * 5, 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.dailyCount}>{dayBookings.length}</Text>
                <Text style={styles.dailyAmount}>৳{dayRevenue.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
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
  monthNav: {
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
  monthTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  revenueCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  paidCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  dueCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  cardLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gold,
    marginTop: 5,
  },
  cardSubtext: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  statusCount: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  outstandingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  outstandingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outstandingRoom: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: Colors.teal,
    textAlign: 'center',
    lineHeight: 45,
    color: Colors.white,
    fontWeight: 'bold',
    marginRight: 12,
    overflow: 'hidden',
  },
  outstandingGuest: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  outstandingDate: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  outstandingRight: {
    alignItems: 'flex-end',
  },
  outstandingDue: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outstandingTotal: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyDate: {
    width: 25,
    color: Colors.textMuted,
    fontSize: 12,
  },
  dailyBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.cardHover,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  dailyBarFill: {
    height: '100%',
    backgroundColor: Colors.teal,
    borderRadius: 4,
  },
  dailyCount: {
    width: 25,
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  dailyAmount: {
    width: 80,
    color: Colors.gold,
    fontSize: 12,
    textAlign: 'right',
  },
});

export default AccountingScreen;
