import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar, DateData } from "react-native-calendars";
import api from "../../lib/api";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  vehicleId: string;
  ownerId: string;
  pricePerDay: number;
  vehicleName: string;
}

export default function BookingModal({
  visible,
  onClose,
  vehicleId,
  ownerId,
  pricePerDay,
  vehicleName,
}: BookingModalProps) {
  const [bookingStart, setBookingStart] = useState<Date | null>(null);
  const [bookingEnd, setBookingEnd] = useState<Date | null>(null);
  const [driverId, setDriverId] = useState("");
  const [needDriver, setNeedDriver] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<{[key: string]: any}>({});
  const [selectingStartDate, setSelectingStartDate] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchUnavailableDates();
      if (needDriver) {
        fetchDrivers();
      }
    }
  }, [visible, needDriver]);

  const fetchUnavailableDates = async () => {
    try {
      const response = await api.get(`/bookings/unavailable-dates/${vehicleId}`);
      const dates: {[key: string]: any} = {};
      
      response.data.unavailableDates.forEach((range: {start: string, end: string}) => {
        const start = new Date(range.start);
        const end = new Date(range.end);
        
        // Mark all dates in the range as disabled
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateString = d.toISOString().split('T')[0];
          dates[dateString] = {
            disabled: true,
            disableTouchEvent: true,
            color: '#EF4444',
            textColor: '#FFFFFF'
          };
        }
      });
      
      setUnavailableDates(dates);
    } catch (error) {
      console.error("Error fetching unavailable dates:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/drivers");
      if (response.data.success && Array.isArray(response.data.drivers)) {
        setDrivers(response.data.drivers);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day: DateData) => {
    const selectedDate = new Date(day.dateString);
    
    if (selectingStartDate) {
      setBookingStart(selectedDate);
      setBookingEnd(null);
      setSelectingStartDate(false);
    } else {
      if (selectedDate <= bookingStart!) {
        Alert.alert("Error", "End date must be after start date");
        return;
      }
      setBookingEnd(selectedDate);
      setSelectingStartDate(true);
    }
  };

  const getMarkedDates = () => {
    const marked: {[key: string]: any} = {};
    
    // First, add all unavailable dates
    Object.keys(unavailableDates).forEach(date => {
      marked[date] = {
        disabled: true,
        disableTouchEvent: true,
        color: '#EF4444',
        textColor: '#FFFFFF',
      };
    });
    
    // Then add selected dates
    if (bookingStart && bookingEnd) {
      const startString = bookingStart.toISOString().split('T')[0];
      const endString = bookingEnd.toISOString().split('T')[0];
      
      marked[startString] = {
        startingDay: true,
        color: '#3B82F6',
        textColor: '#FFFFFF',
      };
      
      marked[endString] = {
        endingDay: true,
        color: '#3B82F6',
        textColor: '#FFFFFF',
      };
      
      // Mark dates in between
      const start = new Date(bookingStart);
      const end = new Date(bookingEnd);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      
      while (current < end) {
        const dateString = current.toISOString().split('T')[0];
        if (!unavailableDates[dateString]) {
          marked[dateString] = {
            color: '#93C5FD',
            textColor: '#1F2937',
          };
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (bookingStart) {
      // When only start date is selected, mark it with solid color
      const startString = bookingStart.toISOString().split('T')[0];
      marked[startString] = {
        startingDay: true,
        endingDay: true,
        color: '#3B82F6',
        textColor: '#FFFFFF',
      };
    }
    
    return marked;
  };

  const calculateDays = () => {
    if (!bookingStart || !bookingEnd) return 0;
    const diffTime = Math.abs(bookingEnd.getTime() - bookingStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    return days * pricePerDay;
  };

  const handleSubmit = async () => {
    // Validation
    if (!bookingStart || !bookingEnd) {
      Alert.alert("Error", "Please select both start and end dates");
      return;
    }

    if (bookingStart >= bookingEnd) {
      Alert.alert("Error", "End date must be after start date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingStart < today) {
      Alert.alert("Error", "Start date cannot be in the past");
      return;
    }

    if (needDriver && !driverId) {
      Alert.alert("Error", "Please select a driver");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("authToken");

      const bookingData = {
        vehicleId,
        ownerId,
        driverId: needDriver ? driverId : null,
        bookingStart: bookingStart.toISOString(),
        bookingEnd: bookingEnd.toISOString(),
        totalAmount: calculateTotal(),
      };

      const response = await api.post("/bookings", bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Alert.alert(
          "Success",
          "Booking request sent successfully! The owner will be notified.",
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to create booking. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setBookingStart(null);
    setBookingEnd(null);
    setDriverId("");
    setNeedDriver(false);
    setSelectingStartDate(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-neutral-900 rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Book {vehicleName}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Date Selection */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Select Dates
                </Text>
                <View className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {selectingStartDate ? "Select Start Date" : "Select End Date"}
                  </Text>
                </View>
              </View>

              {/* Selected Dates Display */}
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-3">
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    Start Date
                  </Text>
                  <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {bookingStart ? bookingStart.toLocaleDateString() : "Not selected"}
                  </Text>
                </View>
                <View className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-3">
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    End Date
                  </Text>
                  <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {bookingEnd ? bookingEnd.toLocaleDateString() : "Not selected"}
                  </Text>
                </View>
              </View>

              {/* Calendar */}
              <View className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={getMarkedDates()}
                  minDate={new Date().toISOString().split('T')[0]}
                  markingType="period"
                  theme={{
                    backgroundColor: '#F9FAFB',
                    calendarBackground: '#F9FAFB',
                    textSectionTitleColor: '#6B7280',
                    selectedDayBackgroundColor: '#3B82F6',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#3B82F6',
                    dayTextColor: '#1F2937',
                    textDisabledColor: '#D1D5DB',
                    dotColor: '#3B82F6',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#3B82F6',
                    monthTextColor: '#1F2937',
                    indicatorColor: '#3B82F6',
                    textDayFontWeight: '400',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                  }}
                />
              </View>

              {/* Legend */}
              <View className="flex-row items-center gap-4 mt-3 px-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-4 h-4 rounded bg-blue-600" />
                  <Text className="text-xs text-neutral-600 dark:text-neutral-400">
                    Selected
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-4 h-4 rounded bg-red-600" />
                  <Text className="text-xs text-neutral-600 dark:text-neutral-400">
                    Booked
                  </Text>
                </View>
              </View>
            </View>

            {/* Driver Option */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setNeedDriver(!needDriver)}
                className="flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-4"
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons
                    name="person"
                    size={24}
                    color={needDriver ? "#3B82F6" : "#6B7280"}
                  />
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Need a Driver?
                  </Text>
                </View>
                <View
                  className={`w-12 h-6 rounded-full ${
                    needDriver ? "bg-blue-600" : "bg-neutral-300"
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full bg-white mt-0.5 ${
                      needDriver ? "ml-6" : "ml-0.5"
                    }`}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Driver Selection */}
            {needDriver && (
              <View className="mb-6">
                <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Select Driver
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : drivers.length > 0 ? (
                  <View className="gap-2">
                    {drivers.map((driver) => (
                      <TouchableOpacity
                        key={driver._id}
                        onPress={() => setDriverId(driver._id)}
                        className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${
                          driverId === driver._id
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                        }`}
                      >
                        <View>
                          <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {driver.name}
                          </Text>
                          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                            {driver.email}
                          </Text>
                        </View>
                        {driverId === driver._id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#3B82F6"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-neutral-600 dark:text-neutral-400 text-center py-4">
                    No drivers available
                  </Text>
                )}
              </View>
            )}

            {/* Price Summary */}
            {bookingStart && bookingEnd && (
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6">
                <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Price Summary
                </Text>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600 dark:text-neutral-400">
                      Price per day
                    </Text>
                    <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                      ৳{pricePerDay}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600 dark:text-neutral-400">
                      Number of days
                    </Text>
                    <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {calculateDays()}
                    </Text>
                  </View>
                  <View className="border-t border-neutral-300 dark:border-neutral-600 pt-2 mt-2">
                    <View className="flex-row justify-between">
                      <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        Total Amount
                      </Text>
                      <Text className="text-lg font-bold text-blue-600">
                        ৳{calculateTotal()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`py-4 rounded-xl ${
                submitting ? "bg-neutral-400" : "bg-blue-600"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white text-lg font-bold">
                  Confirm Booking
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
