import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { SERVER_URL } from "../../lib/api";

interface Booking {
  _id: string;
  vehicleId: {
    _id: string;
    brand: string;
    model: string;
    images: string[];
    pricePerDay: number;
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  bookingStart: string;
  bookingEnd: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function RentHistory() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRentHistory();
  }, []);

  const fetchRentHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await api.get("/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Filter for completed bookings (returned status) and ensure data is populated
      const completedBookings = response.data.filter(
        (booking: Booking) =>
          booking.status === "returned" &&
          booking.vehicleId &&
          booking.ownerId
      );
      setBookings(completedBookings);
    } catch (error) {
      console.error("Error fetching rent history:", error);
      Alert.alert("Error", "Failed to load rent history");
    } finally {
      setLoading(false);
    }
  };

  const handleRateVehicle = (booking: Booking) => {
    setSelectedVehicle(booking.vehicleId);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("authToken");
      
      const response = await api.post(
        `/vehicles/${selectedVehicle._id}/rate`,
        {
          rating,
          review,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Rating submitted successfully!");
        setShowRatingModal(false);
        setRating(0);
        setReview("");
        setSelectedVehicle(null);
      }
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      if (error.response?.data?.code === 400) {
        Alert.alert("Info", "You have already rated this vehicle");
      } else {
        Alert.alert("Error", error.response?.data?.message || "Failed to submit rating");
      }
    } finally {
      setSubmitting(false);
    }
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
      case "returned":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "inUse":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Rent History
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="time-outline" size={64} color="#9CA3AF" />
            <Text className="text-neutral-600 dark:text-neutral-400 mt-4 text-center">
              No rental history yet
            </Text>
            <Text className="text-neutral-500 dark:text-neutral-500 text-sm mt-2 text-center">
              Your completed rentals will appear here
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {bookings.map((booking) => (
              <View
                key={booking._id}
                className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Vehicle Image & Info */}
                <View className="flex-row p-4">
                  {booking.vehicleId.images && booking.vehicleId.images.length > 0 ? (
                    <Image
                      source={{
                        uri: `${SERVER_URL}/public/images/vehicle-images/${booking.vehicleId.images[0]}`,
                      }}
                      style={{ width: 100, height: 100, borderRadius: 12 }}
                    />
                  ) : (
                    <View className="w-25 h-25 bg-neutral-200 dark:bg-neutral-800 rounded-xl items-center justify-center">
                      <Ionicons name="car-sport" size={40} color="#9CA3AF" />
                    </View>
                  )}

                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {booking.vehicleId.brand} {booking.vehicleId.model}
                    </Text>
                    
                    <View className={`self-start px-3 py-1 rounded-full mt-2 ${getStatusColor(booking.status)}`}>
                      <Text className="text-xs font-semibold capitalize">
                        {booking.status}
                      </Text>
                    </View>

                    <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                      ৳{booking.totalAmount}
                    </Text>
                  </View>
                </View>

                {/* Booking Details */}
                <View className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(booking.bookingStart)} - {formatDate(booking.bookingEnd)}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Ionicons name="person-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                      Owner: {booking.ownerId.name}
                    </Text>
                  </View>
                </View>

                {/* Rate Button */}
                {booking.status === "returned" && (
                  <View className="px-4 pb-4">
                    <TouchableOpacity
                      onPress={() => handleRateVehicle(booking)}
                      className="bg-blue-600 py-3 rounded-xl"
                    >
                      <Text className="text-center text-white font-semibold">
                        Rate Vehicle
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-neutral-900 rounded-t-3xl p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Rate Vehicle
              </Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Vehicle Info */}
            {selectedVehicle && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </Text>
              </View>
            )}

            {/* Star Rating */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Rating *
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Review */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Review (Optional)
              </Text>
              <TextInput
                value={review}
                onChangeText={setReview}
                placeholder="Share your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submitRating}
              disabled={submitting}
              className={`py-4 rounded-xl ${
                submitting ? "bg-neutral-400" : "bg-blue-600"
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white text-lg font-bold">
                  Submit Rating
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
