import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SERVER_URL } from "../../lib/api";
import RatingStars from "./RatingStars";

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  type: string;
  category: string;
  images: string[];
  averageRating: number;
  availability: boolean;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const router = useRouter();

  const imageUrl = vehicle.images && vehicle.images.length > 0
    ? `${SERVER_URL}/public/images/vehicle-images/${vehicle.images[0]}`
    : null;

  const handlePress = () => {
    router.push(`/vehicles/${vehicle._id}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-sm mb-4"
      activeOpacity={0.7}
    >
      {/* Image */}
      <View className="relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 192 }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-neutral-200 dark:bg-neutral-700 items-center justify-center">
            <Ionicons name="car-sport" size={48} color="#9CA3AF" />
          </View>
        )}

        {/* Type Badge */}
        <View className="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">{vehicle.type}</Text>
        </View>

        {/* Availability Badge */}
        {!vehicle.availability && (
          <View className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Unavailable</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="p-4">
        {/* Title */}
        <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          {vehicle.brand} {vehicle.model}
        </Text>

        {/* Category & Year */}
        <View className="flex-row items-center gap-2 mb-2">
          <View className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-lg">
            <Text className="text-xs text-neutral-600 dark:text-neutral-300">
              {vehicle.category}
            </Text>
          </View>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            • {vehicle.year}
          </Text>
        </View>

        {/* Rating */}
        <View className="mb-3">
          <RatingStars rating={vehicle.averageRating || 0} size={14} />
        </View>

        {/* Location & Price */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              {vehicle.location}
            </Text>
          </View>

          <View className="flex-row items-baseline gap-1">
            <Text className="text-2xl font-bold text-blue-600">
              ৳{vehicle.pricePerDay}
            </Text>
            <Text className="text-sm text-neutral-500 dark:text-neutral-400">
              /day
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
