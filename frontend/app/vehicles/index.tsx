import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VehicleCard from "../../components/vehicles/VehicleCard";
import SearchBar from "../../components/vehicles/SearchBar";
import VehicleFilters, {
  FilterState,
} from "../../components/vehicles/VehicleFilters";

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

export default function VehiclesListing() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    category: [],
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, filters, searchQuery]);

  const fetchVehicles = async (search?: string) => {
    try {
      setLoading(true);
      const response = await api.get("/allvehicles", {
        params: { search: search || "" },
      });

      if (Array.isArray(response.data)) {
        setVehicles(response.data);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVehicles(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    fetchVehicles(searchQuery);
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Apply type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter((v) => filters.type.includes(v.type));
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter((v) => filters.category.includes(v.category));
    }

    // Apply price range filter
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter((v) => v.pricePerDay >= minPrice);
    }

    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter((v) => v.pricePerDay <= maxPrice);
    }

    setFilteredVehicles(filtered);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.type.length;
    count += filters.category.length;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-full items-center justify-center mb-4">
        <Ionicons name="car-sport-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        No Vehicles Found
      </Text>
      <Text className="text-center text-neutral-600 dark:text-neutral-400">
        {searchQuery || getActiveFilterCount() > 0
          ? "Try adjusting your search or filters"
          : "No vehicles available at the moment"}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="px-6 pb-4">
      <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
        {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""}{" "}
        available
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Browse Vehicles
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mb-3">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={handleSearch}
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          className="flex-row items-center justify-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl py-3"
        >
          <Ionicons name="options" size={20} color="#6B7280" />
          <Text className="text-neutral-700 dark:text-neutral-300 font-semibold">
            Filters
            {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          contentContainerStyle={{ padding: 24, paddingTop: 16 }}
          ListHeaderComponent={renderHeader}
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

      {/* Filters Modal */}
      <VehicleFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}
