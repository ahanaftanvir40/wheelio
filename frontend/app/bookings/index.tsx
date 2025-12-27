import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../lib/api";

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  pricePerDay: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Booking {
  _id: string;
  vehicleId: Vehicle;
  userId: User;
  ownerId: User;
  bookingStart: string;
  bookingEnd: string;
  status: string;
  totalAmount: number;
}

export default function Bookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [outgoingBookings, setOutgoingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      // Fetch incoming requests (for my vehicles)
      const incomingResponse = await api.get("/bookings/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch outgoing requests (my booking requests)
      const outgoingResponse = await api.get("/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIncomingBookings(Array.isArray(incomingResponse.data) ? incomingResponse.data : []);
      setOutgoingBookings(Array.isArray(outgoingResponse.data) ? outgoingResponse.data : []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const handleApprove = async (bookingId: string) => {
    Alert.alert(
      "Approve Booking",
      "Are you sure you want to approve this booking request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              await api.post(`/bookings/${bookingId}/approve`, {}, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert("Success", "Booking approved successfully!");
              fetchBookings();
            } catch (error) {
              console.error("Error approving booking:", error);
              Alert.alert("Error", "Failed to approve booking");
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              await api.delete(`/booking/${bookingId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert("Success", "Booking cancelled successfully!");
              fetchBookings();
            } catch (error) {
              console.error("Error cancelling booking:", error);
              Alert.alert("Error", "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const handleMarkAsReturned = async (bookingId: string) => {
    Alert.alert(
      "Mark as Returned",
      "Confirm that the vehicle has been returned?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              await api.post(`/bookings/${bookingId}/return`, {}, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert("Success", "Booking marked as returned successfully!");
              fetchBookings();
            } catch (error: any) {
              console.error("Error marking as returned:", error);
              Alert.alert("Error", error.response?.data || "Failed to mark as returned");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
    }
  };

  const renderBookingCard = (booking: Booking, isIncoming: boolean) => {
    // Check if required data is populated
    if (!booking.vehicleId || !booking.userId || !booking.ownerId) {
      return null;
    }

    return (
      <View
        key={booking._id}
        className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-4 shadow-sm"
      >
        {/* Vehicle Info */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {booking.vehicleId.brand} {booking.vehicleId.model}
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              {isIncoming ? `Requested by: ${booking.userId.name}` : `Owner: ${booking.ownerId.name}`}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
            <Text className="text-xs font-semibold capitalize">{booking.status}</Text>
          </View>
        </View>

      {/* Dates */}
      <View className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3 mb-3">
        <View className="flex-row items-center gap-2 mb-2">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(booking.bookingStart)} - {formatDate(booking.bookingEnd)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons name="cash-outline" size={16} color="#6B7280" />
          <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Total: ৳{booking.totalAmount}
          </Text>
        </View>
      </View>

      {/* Actions */}
      {isIncoming && booking.status === "pending" && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleApprove(booking._id)}
            className="flex-1 bg-green-600 py-3 rounded-xl"
          >
            <Text className="text-center text-white font-semibold">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCancel(booking._id)}
            className="flex-1 bg-red-600 py-3 rounded-xl"
          >
            <Text className="text-center text-white font-semibold">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {isIncoming && booking.status === "approved" && (
        <TouchableOpacity
          onPress={() => handleMarkAsReturned(booking._id)}
          className="bg-blue-600 py-3 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">Mark as Returned</Text>
        </TouchableOpacity>
      )}

      {!isIncoming && booking.status === "pending" && (
        <TouchableOpacity
          onPress={() => handleCancel(booking._id)}
          className="bg-red-600 py-3 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">Cancel Request</Text>
        </TouchableOpacity>
      )}
      </View>
    );
  };

  const renderEmptyState = (type: "incoming" | "outgoing") => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-full items-center justify-center mb-4">
        <Ionicons
          name={type === "incoming" ? "notifications-outline" : "car-sport-outline"}
          size={48}
          color="#9CA3AF"
        />
      </View>
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        No {type === "incoming" ? "Incoming" : "Outgoing"} Requests
      </Text>
      <Text className="text-center text-neutral-600 dark:text-neutral-400">
        {type === "incoming"
          ? "You don't have any booking requests for your vehicles"
          : "You haven't made any booking requests yet"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Bookings
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage your rental requests
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("incoming")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "incoming"
                ? "bg-blue-600"
                : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "incoming"
                  ? "text-white"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Incoming ({incomingBookings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("outgoing")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "outgoing"
                ? "bg-blue-600"
                : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "outgoing"
                  ? "text-white"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              My Requests ({outgoingBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 py-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
        >
          {activeTab === "incoming" ? (
            incomingBookings.length > 0 ? (
              incomingBookings.map((booking) => renderBookingCard(booking, true))
            ) : (
              renderEmptyState("incoming")
            )
          ) : outgoingBookings.length > 0 ? (
            outgoingBookings.map((booking) => renderBookingCard(booking, false))
          ) : (
            renderEmptyState("outgoing")
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
