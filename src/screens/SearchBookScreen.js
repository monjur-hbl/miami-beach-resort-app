// Miami Beach Resort - Search & Book Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { fetchBookings, createBooking } from '../services/api';
import { Config, getRoomInfo } from '../constants/config';
import Colors from '../constants/colors';

const SearchBookScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    numAdult: '2',
    numChild: '0',
  });
  const [submitting, setSubmitting] = useState(false);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckIn(today.toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
    
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

  // Check if a unit is available for the selected dates
  const isUnitAvailable = (roomId, unitId) => {
    if (!checkIn || !checkOut) return true;
    
    return !bookings.some(b => 
      b.roomId === roomId &&
      b.unitId === unitId &&
      b.arrival < checkOut &&
      b.departure > checkIn
    );
  };

  // Toggle unit selection
  const toggleUnit = (roomId, unitId) => {
    const key = `${roomId}-${unitId}`;
    if (selectedUnits.find(u => u.key === key)) {
      setSelectedUnits(selectedUnits.filter(u => u.key !== key));
    } else {
      if (isUnitAvailable(roomId, unitId)) {
        const room = Config.ROOMS.find(r => r.id === roomId);
        selectedUnits.push({
          key,
          roomId,
          unitId,
          roomName: room?.short || 'Room',
          num: getRoomInfo(roomId, unitId).num,
        });
        setSelectedUnits([...selectedUnits]);
      }
    }
  };

  // Handle booking submission
  const handleSubmitBooking = async () => {
    if (!bookingForm.firstName.trim()) {
      Alert.alert('Error', 'Please enter guest name');
      return;
    }
    if (!bookingForm.mobile.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }
    if (selectedUnits.length === 0) {
      Alert.alert('Error', 'Please select at least one room');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = selectedUnits.map(unit => ({
        propertyId: Config.PROPERTY_ID,
        roomId: unit.roomId,
        unitId: unit.unitId,
        arrival: checkIn,
        departure: checkOut,
        firstName: bookingForm.firstName,
        lastName: bookingForm.lastName,
        mobile: bookingForm.mobile,
        email: bookingForm.email,
        numAdult: parseInt(bookingForm.numAdult) || 2,
        numChild: parseInt(bookingForm.numChild) || 0,
        status: 'confirmed',
        referer: 'miami_app',
      }));

      await createBooking(bookingData);
      
      Alert.alert(
        'Success',
        `Booking confirmed for ${selectedUnits.length} room(s)`,
        [{ text: 'OK', onPress: () => {
          setSelectedUnits([]);
          setShowBookingForm(false);
          setBookingForm({
            firstName: '',
            lastName: '',
            mobile: '',
            email: '',
            numAdult: '2',
            numChild: '0',
          });
          loadBookings();
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate nights
  const nights = checkIn && checkOut ? 
    Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 0;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Selection */}
      <View style={styles.dateSection}>
        <View style={styles.dateInput}>
          <Text style={styles.dateLabel}>Check-in</Text>
          <TextInput
            style={styles.dateValue}
            value={checkIn}
            onChangeText={setCheckIn}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <Text style={styles.dateArrow}>→</Text>
        <View style={styles.dateInput}>
          <Text style={styles.dateLabel}>Check-out</Text>
          <TextInput
            style={styles.dateValue}
            value={checkOut}
            onChangeText={setCheckOut}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <View style={styles.nightsBadge}>
          <Text style={styles.nightsText}>{nights}N</Text>
        </View>
      </View>

      {/* Room Selection Grid */}
      <ScrollView style={styles.roomsSection}>
        {Config.ROOMS.map(room => (
          <View key={room.id} style={styles.roomGroup}>
            <Text style={styles.roomGroupTitle}>{room.short}</Text>
            <View style={styles.unitsGrid}>
              {Array.from({ length: room.units }, (_, i) => {
                const unitId = i + 1;
                const num = Config.ROOM_NUMBERS[room.id]?.[unitId] || unitId;
                const available = isUnitAvailable(room.id, unitId);
                const selected = selectedUnits.find(u => u.key === `${room.id}-${unitId}`);
                
                return (
                  <TouchableOpacity
                    key={unitId}
                    style={[
                      styles.unitCard,
                      !available && styles.unitUnavailable,
                      selected && styles.unitSelected,
                    ]}
                    onPress={() => toggleUnit(room.id, unitId)}
                    disabled={!available}
                  >
                    <Text style={[
                      styles.unitNumber,
                      !available && styles.unitTextUnavailable,
                      selected && styles.unitTextSelected,
                    ]}>
                      {num}
                    </Text>
                    {!available && <Text style={styles.bookedText}>Booked</Text>}
                    {selected && <Text style={styles.selectedIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Selection Summary & Book Button */}
      {selectedUnits.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.selectedCount}>{selectedUnits.length} room(s) selected</Text>
            <Text style={styles.selectedRooms}>
              {selectedUnits.map(u => u.num).join(', ')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => setShowBookingForm(true)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Guest Details</Text>
            <Text style={styles.modalSubtitle}>
              {selectedUnits.length} room(s) • {checkIn} to {checkOut}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="First Name *"
              placeholderTextColor={Colors.textMuted}
              value={bookingForm.firstName}
              onChangeText={v => setBookingForm({...bookingForm, firstName: v})}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={Colors.textMuted}
              value={bookingForm.lastName}
              onChangeText={v => setBookingForm({...bookingForm, lastName: v})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone *"
              placeholderTextColor={Colors.textMuted}
              value={bookingForm.mobile}
              onChangeText={v => setBookingForm({...bookingForm, mobile: v})}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={bookingForm.email}
              onChangeText={v => setBookingForm({...bookingForm, email: v})}
              keyboardType="email-address"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Adults"
                placeholderTextColor={Colors.textMuted}
                value={bookingForm.numAdult}
                onChangeText={v => setBookingForm({...bookingForm, numAdult: v})}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Children"
                placeholderTextColor={Colors.textMuted}
                value={bookingForm.numChild}
                onChangeText={v => setBookingForm({...bookingForm, numChild: v})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBookingForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSubmitBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
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
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
    backgroundColor: Colors.cardHover,
    padding: 10,
    borderRadius: 8,
  },
  dateArrow: {
    fontSize: 20,
    color: Colors.textMuted,
    marginHorizontal: 15,
  },
  nightsBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
  },
  nightsText: {
    color: Colors.darkSlate,
    fontWeight: 'bold',
  },
  roomsSection: {
    flex: 1,
    padding: 15,
  },
  roomGroup: {
    marginBottom: 20,
  },
  roomGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.gold,
    marginBottom: 10,
  },
  unitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitCard: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 10,
    margin: '1%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.success,
  },
  unitUnavailable: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  unitSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldLight,
  },
  unitNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  unitTextUnavailable: {
    color: Colors.textMuted,
  },
  unitTextSelected: {
    color: Colors.gold,
  },
  bookedText: {
    fontSize: 8,
    color: Colors.error,
    marginTop: 2,
  },
  selectedIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    color: Colors.gold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerInfo: {
    flex: 1,
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  selectedRooms: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  bookButtonText: {
    color: Colors.darkSlate,
    fontWeight: 'bold',
    fontSize: 16,
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
    maxWidth: 400,
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
    marginBottom: 25,
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
  modalButtons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.darkSlate,
    fontWeight: 'bold',
  },
});

export default SearchBookScreen;
