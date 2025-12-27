import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { SERVER_URL } from "../../lib/api";
import RatingStars from "../../components/vehicles/RatingStars";
import BookingModal from "../../components/booking/BookingModal";

const { width } = Dimensions.get("window");

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Rating {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  review: string;
  createdAt: string;
}

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  latitude?: number;
  longitude?: number;
  type: string;
  category: string;
  condition: string;
  description: string;
  images: string[];
  averageRating: number;
  availability: boolean;
  no_plate: string;
  chassis_no: string;
  registration_no: string;
  ownerId: Owner;
  ratings: Rating[];
}

export default function VehicleDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVehicleDetails();
      fetchCurrentUser();
    }
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUserId(response.data._id);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      
      const response = await api.get(`/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVehicle(response.data);
    } catch (error: any) {
      console.error("Error fetching vehicle details:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load vehicle details"
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const isOwner = vehicle?.ownerId?._id === currentUserId;

  const handleBookNow = () => {
    if (!vehicle?.availability) {
      Alert.alert("Unavailable", "This vehicle is currently not available for booking.");
      return;
    }
    setShowBookingModal(true);
  };

  const handleContactOwner = () => {
    if (vehicle?.ownerId && currentUserId) {
      router.push(
        `/chats/${vehicle._id}/${vehicle.ownerId._id}/${currentUserId}` as any
      );
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
            Vehicle Not Found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="relative">
          {vehicle.images && vehicle.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / width
                  );
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {vehicle.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{
                      uri: `${SERVER_URL}/public/images/vehicle-images/${image}`,
                    }}
                    style={{ width, height: 300 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              {/* Image Indicators */}
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
                {vehicle.images.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full ${
                      index === currentImageIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </View>
            </>
          ) : (
            <View
              style={{ width, height: 300 }}
              className="bg-neutral-200 dark:bg-neutral-800 items-center justify-center"
            >
              <Ionicons name="car-sport" size={64} color="#9CA3AF" />
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Availability Badge */}
          <View
            className={`absolute top-4 right-4 px-3 py-1 rounded-full ${
              vehicle.availability ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <Text className="text-white text-xs font-semibold">
              {vehicle.availability ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Title & Price */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {vehicle.brand} {vehicle.model}
              </Text>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-lg">
                  <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {vehicle.type}
                  </Text>
                </View>
                <View className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">
                  <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                    {vehicle.category}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-bold text-blue-600">
                ৳{vehicle.pricePerDay}
              </Text>
              <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                per day
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-2 mb-6">
            <RatingStars rating={vehicle.averageRating || 0} size={18} />
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              ({vehicle.ratings?.length || 0} review
              {vehicle.ratings?.length !== 1 ? "s" : ""})
            </Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-2 mb-6">
            <Ionicons name="location" size={20} color="#3B82F6" />
            <Text className="text-base text-neutral-700 dark:text-neutral-300">
              {vehicle.location}
            </Text>
          </View>

          {/* Vehicle Details */}
          <View className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 mb-6">
            <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Vehicle Details
            </Text>
            <View className="gap-3">
              <DetailRow label="Year" value={vehicle.year.toString()} />
              <DetailRow label="Condition" value={vehicle.condition} />
              <DetailRow label="Plate Number" value={vehicle.no_plate} />
              <DetailRow label="Chassis Number" value={vehicle.chassis_no} />
              <DetailRow
                label="Registration Number"
                value={vehicle.registration_no}
              />
            </View>
          </View>

          {/* Description */}
          {vehicle.description && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Description
              </Text>
              <Text className="text-base text-neutral-600 dark:text-neutral-400 leading-6">
                {vehicle.description}
              </Text>
            </View>
          )}

          {/* Owner Info */}
          {vehicle.ownerId && (
            <View className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 mb-6">
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Owner Information
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {vehicle.ownerId.name}
                  </Text>
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                    {vehicle.ownerId.email}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleContactOwner}
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews */}
          {vehicle.ratings && vehicle.ratings.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                Reviews
              </Text>
              {vehicle.ratings.map((rating) => (
                <View
                  key={rating._id}
                  className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {rating.userId.name}
                    </Text>
                    <RatingStars rating={rating.rating} size={14} />
                  </View>
                  {rating.review && (
                    <Text className="text-neutral-600 dark:text-neutral-400 mb-2">
                      {rating.review}
                    </Text>
                  )}
                  <Text className="text-xs text-neutral-500 dark:text-neutral-500">
                    {formatDate(rating.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      {!isOwner && (
        <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <TouchableOpacity
            onPress={handleBookNow}
            disabled={!vehicle.availability}
            className={`py-4 rounded-xl ${
              vehicle.availability
                ? "bg-blue-600"
                : "bg-neutral-300 dark:bg-neutral-700"
            }`}
          >
            <Text className="text-center text-white text-lg font-bold">
              {vehicle.availability ? "Book Now" : "Currently Unavailable"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Modal */}
      {vehicle && (
        <BookingModal
          visible={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          vehicleId={vehicle._id}
          ownerId={vehicle.ownerId._id}
          pricePerDay={vehicle.pricePerDay}
          vehicleName={`${vehicle.brand} ${vehicle.model}`}
        />
      )}
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-neutral-600 dark:text-neutral-400">{label}</Text>
      <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
      </Text>
    </View>
  );
}
