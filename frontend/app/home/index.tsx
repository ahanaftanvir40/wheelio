import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-600 dark:text-neutral-400">
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          {/* App Name */}
          <View className="flex-row items-center gap-2">
            <View className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center">
              <Ionicons name="car-sport" size={24} color="white" />
            </View>
            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Wheelio
            </Text>
          </View>

          {/* User Avatar */}
          <TouchableOpacity className="flex-row items-center gap-3">
            <View>
              <Text className="text-sm font-semibold text-right text-neutral-900 dark:text-neutral-100">
                {user?.name || "User"}
              </Text>
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                {user?.userType || "Member"}
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center border-2 border-white dark:border-neutral-800">
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome back! 👋
          </Text>
          <Text className="text-base text-neutral-600 dark:text-neutral-400 mt-1">
            What would you like to do today?
          </Text>
        </View>

        {/* Bento Box Grid */}
        <View className="px-6 pb-6 gap-4">
          {/* Row 1 - My Listings & Rental Requests */}
          <View className="flex-row gap-4">
            {/* My Listings Card */}
            <TouchableOpacity className="flex-1 h-40 rounded-3xl overflow-hidden">
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5 justify-between"
              >
                <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                  <Ionicons name="list" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-xl font-bold">
                    My Listings
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    View your vehicles
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Rental Requests Card */}
            <TouchableOpacity className="flex-1 h-40 rounded-3xl overflow-hidden">
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5 justify-between"
              >
                <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                  <Ionicons name="notifications" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-xl font-bold">Requests</Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Rental requests
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Row 2 - Rent a Vehicle & List a Vehicle */}
          <View className="flex-row gap-4">
            {/* Rent a Vehicle Card */}
            <TouchableOpacity className="flex-1 h-40 rounded-3xl overflow-hidden">
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5 justify-between"
              >
                <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                  <Ionicons name="search" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-xl font-bold">
                    Rent Vehicle
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Browse rentals
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* List a Vehicle Card */}
            <TouchableOpacity
              className="flex-1 h-40 rounded-3xl overflow-hidden"
              onPress={() => router.push("/list-vehicle")}
            >
              <LinearGradient
                colors={["#EC4899", "#BE185D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 p-5 justify-between"
              >
                <View className="bg-white/20 w-12 h-12 rounded-2xl items-center justify-center">
                  <Ionicons name="add-circle" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-xl font-bold">
                    List Vehicle
                  </Text>
                  <Text className="text-white/80 text-sm mt-1">
                    Add your car
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Row 3 - WheelioHub (Large Card) */}
          <TouchableOpacity className="h-56 rounded-3xl overflow-hidden">
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 p-6 justify-between"
            >
              <View className="flex-row items-center justify-between">
                <View className="bg-white/20 w-14 h-14 rounded-2xl items-center justify-center">
                  <Ionicons name="people" size={28} color="white" />
                </View>
                <View className="bg-white/20 px-4 py-2 rounded-full">
                  <Text className="text-white font-semibold text-xs">
                    Community
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-white text-3xl font-bold mb-2">
                  WheelioHub
                </Text>
                <Text className="text-white/90 text-base mb-4">
                  Connect with the community, share experiences, and discover
                  the best rental deals
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-row -space-x-2">
                    <View className="w-8 h-8 rounded-full bg-white border-2 border-amber-500" />
                    <View className="w-8 h-8 rounded-full bg-white border-2 border-amber-500" />
                    <View className="w-8 h-8 rounded-full bg-white border-2 border-amber-500" />
                  </View>
                  <Text className="text-white/80 text-sm">
                    Join 1,000+ members
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
