import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../lib/api";
import VehicleCard from "../../components/vehicles/VehicleCard";

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
  description: string;
}

export default function MyListings() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const response = await api.get("/my-vehicles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && Array.isArray(response.data.vehicles)) {
        setVehicles(response.data.vehicles);
      } else {
        setVehicles([]);
      }
    } catch (error: any) {
      console.error("Error fetching my vehicles:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load your vehicles"
      );
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyVehicles();
  }, []);

  const handleAddVehicle = () => {
    router.push("/list-vehicle");
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-6">
        <Ionicons name="car-sport-outline" size={64} color="#3B82F6" />
      </View>
      <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
        No Vehicles Listed
      </Text>
      <Text className="text-center text-neutral-600 dark:text-neutral-400 mb-8 px-4">
        You haven&apos;t listed any vehicles yet. Start earning by listing your
        vehicle for rent!
      </Text>
      <TouchableOpacity
        onPress={handleAddVehicle}
        className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center gap-2"
      >
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text className="text-white font-bold text-lg">List Your Vehicle</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View className="px-6 pb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} listed
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddVehicle}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center gap-2"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold">Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-xs text-neutral-600 dark:text-neutral-400">
              Available
            </Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {vehicles.filter((v) => v.availability).length}
          </Text>
        </View>

        <View className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text className="text-xs text-neutral-600 dark:text-neutral-400">
              Unavailable
            </Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {vehicles.filter((v) => !v.availability).length}
          </Text>
        </View>

        <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="cash" size={20} color="#3B82F6" />
            <Text className="text-xs text-neutral-600 dark:text-neutral-400">
              Avg. Price
            </Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            ৳
            {vehicles.length > 0
              ? Math.round(
                  vehicles.reduce((sum, v) => sum + v.pricePerDay, 0) /
                    vehicles.length
                )
              : 0}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              My Listings
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              Manage your rental vehicles
            </Text>
          </View>
        </View>
      </View>

      {/* Vehicle List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          contentContainerStyle={{ padding: 24, paddingTop: 16 }}
          ListHeaderComponent={vehicles.length > 0 ? renderHeader : null}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
