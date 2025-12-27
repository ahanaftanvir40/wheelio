import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { SERVER_URL } from "../../lib/api";
import { useAuth } from "../../context/authContext";

export default function Profile() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const handleEditProfile = () => {
    router.push("/profile/edit" as any);
  };

  if (loading || !user) {
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
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Profile
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEditProfile}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center py-8 bg-white dark:bg-neutral-900">
          <View className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center border-4 border-white dark:border-neutral-800 shadow-lg">
            {user.avatar ? (
              <Image
                source={{
                  uri: user.avatar.startsWith("http")
                    ? user.avatar
                    : `${SERVER_URL}/images/user-avatars/${user.avatar}`,
                }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            ) : (
              <Text className="text-white font-bold text-5xl">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
            {user.name}
          </Text>
          <View className="bg-blue-100 dark:bg-blue-900/30 px-4 py-1 rounded-full mt-2">
            <Text className="text-blue-700 dark:text-blue-300 font-semibold">
              {user.userType}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View className="px-6 py-4">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Personal Information
          </Text>

          <View className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-4">
            <InfoRow icon="mail" label="Email" value={user.email} />
            <InfoRow icon="call" label="Phone" value={user.phoneNumber} />
          </View>

          {/* Driver-specific information */}
          {user.userType === "Driver" && (
            <>
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4 mt-6">
                Driver Information
              </Text>
              <View className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-4">
                {user.drivingLicense && (
                  <InfoRow
                    icon="card"
                    label="Driving License"
                    value={user.drivingLicense}
                  />
                )}
                {user.nationalId && (
                  <InfoRow
                    icon="finger-print"
                    label="National ID"
                    value={user.nationalId}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
      <View className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {label}
        </Text>
        <Text className="text-base text-neutral-900 dark:text-neutral-100 font-medium">
          {value}
        </Text>
      </View>
    </View>
  );
}
