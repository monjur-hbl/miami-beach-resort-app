// Miami Beach Resort - Booking Detail Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { updateBooking } from '../services/api';
import { getRoomInfo, Config } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

const BookingDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { canEditBookings, canViewFinancials, isHousekeeping } = useAuth();
  
  const { booking: initialBooking, bookings } = route.params;
  const [booking, setBooking] = useState(initialBooking);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: booking.firstName || '',
    lastName: booking.lastName || '',
    mobile: booking.mobile || '',
    email: booking.email || '',
    numAdult: (booking.numAdult || 1).toString(),
    numChild: (booking.numChild || 0).toString(),
  });

  const { room, num } = getRoomInfo(booking.roomId, booking.unitId);
  const price = parseFloat(booking.price) || 0;
  const paid = parseFloat(booking.deposit) || 0;
  const due = price - paid;
  const nights = Math.max(1, Math.ceil(
    (new Date(booking.departure) - new Date(booking.arrival)) / (1000 * 60 * 60 * 24)
  ));

  // Find group bookings (if any)
  const groupId = String(booking.masterId || booking.id);
  const groupBookings = bookings.filter(b => 
    String(b.masterId) === groupId || String(b.id) === groupId
  );
  const isGroupBooking = groupBookings.length > 1;

  // Calculate group totals
  const groupTotalPrice = groupBookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
  const groupTotalPaid = groupBookings.reduce((sum, b) => sum + (parseFloat(b.deposit) || 0), 0);
  const groupTotalDue = groupTotalPrice - groupTotalPaid;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBooking(booking.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        mobile: editForm.mobile,
        email: editForm.email,
        numAdult: parseInt(editForm.numAdult) || 1,
        numChild: parseInt(editForm.numChild) || 0,
      });
      
      setBooking({
        ...booking,
        ...editForm,
        numAdult: parseInt(editForm.numAdult) || 1,
        numChild: parseInt(editForm.numChild) || 0,
      });
      setEditing(false);
      Alert.alert('Success', 'Booking updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ label, value, highlight }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoHighlight]}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Room Header */}
      <View style={styles.header}>
        <View style={styles.roomBadge}>
          <Text style={styles.roomNumber}>{num}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.guestName}>
            {booking.firstName} {booking.lastName}
          </Text>
          <Text style={styles.roomType}>{room?.name || 'Room'}</Text>
          <Text style={styles.bookingId}>Booking #{booking.id}</Text>
        </View>
        {canEditBookings() && !isHousekeeping() && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <Text style={styles.editButtonText}>{editing ? '✕' : '✏️'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Group Booking Banner */}
      {isGroupBooking && (
        <View style={styles.groupBanner}>
          <Text style={styles.groupTitle}>👥 Group Booking ({groupBookings.length} rooms)</Text>
          <Text style={styles.groupRooms}>
            Rooms: {groupBookings.map(b => getRoomInfo(b.roomId, b.unitId).num).join(', ')}
          </Text>
        </View>
      )}

      {/* Edit Form */}
      {editing && (
        <View style={styles.editForm}>
          <Text style={styles.sectionTitle}>Edit Guest Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={Colors.textMuted}
            value={editForm.firstName}
            onChangeText={v => setEditForm({...editForm, firstName: v})}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor={Colors.textMuted}
            value={editForm.lastName}
            onChangeText={v => setEditForm({...editForm, lastName: v})}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            value={editForm.mobile}
            onChangeText={v => setEditForm({...editForm, mobile: v})}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={editForm.email}
            onChangeText={v => setEditForm({...editForm, email: v})}
            keyboardType="email-address"
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Adults"
              placeholderTextColor={Colors.textMuted}
              value={editForm.numAdult}
              onChangeText={v => setEditForm({...editForm, numAdult: v})}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Children"
              placeholderTextColor={Colors.textMuted}
              value={editForm.numChild}
              onChangeText={v => setEditForm({...editForm, numChild: v})}
              keyboardType="numeric"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <InfoRow label="Check-in" value={booking.arrival} />
        <InfoRow label="Check-out" value={booking.departure} />
        <InfoRow label="Nights" value={nights} />
        <InfoRow label="Guests" value={`${booking.numAdult || 1} Adults, ${booking.numChild || 0} Children`} />
        <InfoRow label="Status" value={booking.status || 'Confirmed'} />
      </View>

      {/* Guest Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Guest Information</Text>
        <InfoRow label="Name" value={`${booking.firstName} ${booking.lastName}`} />
        <InfoRow label="Phone" value={booking.mobile} />
        <InfoRow label="Email" value={booking.email} />
        <InfoRow label="NID/Passport" value={booking.custom4} />
      </View>

      {/* Payment Information */}
      {canViewFinancials() && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          {isGroupBooking ? (
            <>
              <Text style={styles.groupPaymentTitle}>Individual Rooms:</Text>
              {groupBookings.map(b => {
                const bNum = getRoomInfo(b.roomId, b.unitId).num;
                const bPrice = parseFloat(b.price) || 0;
                const bPaid = parseFloat(b.deposit) || 0;
                return (
                  <View key={b.id} style={styles.groupPaymentRow}>
                    <Text style={styles.groupPaymentRoom}>{bNum}</Text>
                    <Text style={styles.groupPaymentGuest}>{b.firstName}</Text>
                    <Text style={styles.groupPaymentAmount}>৳{bPrice.toLocaleString()}</Text>
                    <Text style={[
                      styles.groupPaymentPaid,
                      { color: bPaid >= bPrice ? Colors.success : Colors.warning }
                    ]}>
                      Paid: ৳{bPaid.toLocaleString()}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Group Total</Text>
                <Text style={styles.totalValue}>৳{groupTotalPrice.toLocaleString()}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={[styles.totalValue, { color: Colors.success }]}>
                  ৳{groupTotalPaid.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.dueRow]}>
                <Text style={styles.dueLabel}>Balance Due</Text>
                <Text style={[styles.dueValue, { color: groupTotalDue > 0 ? Colors.error : Colors.success }]}>
                  ৳{groupTotalDue.toLocaleString()}
                </Text>
              </View>
            </>
          ) : (
            <>
              <InfoRow label="Total Amount" value={`৳${price.toLocaleString()}`} />
              <InfoRow label="Rate/Night" value={`৳${Math.round(price/nights).toLocaleString()}`} />
              <InfoRow label="Paid" value={`৳${paid.toLocaleString()}`} highlight />
              <View style={[styles.totalRow, styles.dueRow]}>
                <Text style={styles.dueLabel}>Balance Due</Text>
                <Text style={[styles.dueValue, { color: due > 0 ? Colors.error : Colors.success }]}>
                  ৳{due.toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Source Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Source</Text>
        <InfoRow label="Channel" value={booking.apiSource || booking.channel || 'Direct'} />
        <InfoRow label="Agent" value={booking.referer || 'N/A'} />
        <InfoRow label="External Ref" value={booking.apiReference} />
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkSlate,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roomBadge: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: Colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  guestName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  roomType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bookingId: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 20,
  },
  groupBanner: {
    backgroundColor: Colors.goldLight,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gold,
  },
  groupTitle: {
    color: Colors.gold,
    fontWeight: 'bold',
    fontSize: 14,
  },
  groupRooms: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  editForm: {
    backgroundColor: Colors.card,
    padding: 20,
    margin: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    backgroundColor: Colors.cardHover,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 10,
    padding: 14,
    color: Colors.white,
    fontSize: 15,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: Colors.teal,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: Colors.card,
    margin: 15,
    marginBottom: 0,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gold,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  infoHighlight: {
    color: Colors.success,
    fontWeight: 'bold',
  },
  groupPaymentTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  groupPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  groupPaymentRoom: {
    width: 40,
    color: Colors.white,
    fontWeight: 'bold',
  },
  groupPaymentGuest: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  groupPaymentAmount: {
    color: Colors.white,
    fontWeight: '500',
    marginRight: 15,
  },
  groupPaymentPaid: {
    fontSize: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  totalLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  totalValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  dueRow: {
    backgroundColor: Colors.cardHover,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: -20,
    marginTop: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomWidth: 0,
  },
  dueLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dueValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BookingDetailScreen;
