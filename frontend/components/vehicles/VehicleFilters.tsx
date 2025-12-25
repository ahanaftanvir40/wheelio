import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface VehicleFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  type: string[];
  category: string[];
  minPrice: string;
  maxPrice: string;
}

const VEHICLE_TYPES = ["Car", "Bike"];

const CATEGORIES = [
  "Sedan",
  "SUV",
  "Sports Car",
  "Wagon",
  "MiniVan",
  "Convertible",
  "Commuter Bike",
  "Sports Bike",
  "Cruiser Bike",
  "Scooter",
];

export default function VehicleFilters({
  visible,
  onClose,
  onApply,
  initialFilters,
}: VehicleFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      type: [],
      category: [],
      minPrice: "",
      maxPrice: "",
    }
  );

  const toggleType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...prev.category, category],
    }));
  };

  const handleReset = () => {
    setFilters({
      type: [],
      category: [],
      minPrice: "",
      maxPrice: "",
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Filters
          </Text>
          <TouchableOpacity onPress={handleReset}>
            <Text className="text-blue-600 font-semibold">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-4">
          {/* Vehicle Type */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Vehicle Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleType(type)}
                  className={`px-4 py-2 rounded-full border ${
                    filters.type.includes(type)
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      filters.type.includes(type)
                        ? "text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full border ${
                    filters.category.includes(category)
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      filters.category.includes(category)
                        ? "text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Price Range (Per Day)
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Min Price
                </Text>
                <TextInput
                  value={filters.minPrice}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, minPrice: text }))
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Max Price
                </Text>
                <TextInput
                  value={filters.maxPrice}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, maxPrice: text }))
                  }
                  placeholder="10000"
                  keyboardType="numeric"
                  className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <TouchableOpacity
            onPress={handleApply}
            className="bg-blue-600 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-bold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
