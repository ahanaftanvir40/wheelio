import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../lib/api";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        router.replace("/auth");
        return;
      }

      // Fetch user profile
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUser(response.data);
      } else {
        router.replace("/auth");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.replace("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken");
          router.replace("/auth");
        },
      },
    ]);
  };

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
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-6 py-8">
        <Text className="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">
          Welcome to Wheelio
        </Text>
        <Text className="text-lg mb-8 text-neutral-600 dark:text-neutral-400">
          You&apos;re signed in!
        </Text>

        {user && (
          <View className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-2xl mb-6">
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Name
            </Text>
            <Text className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              {user.name}
            </Text>

            <Text className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Email
            </Text>
            <Text className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              {user.email}
            </Text>

            <Text className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              User Type
            </Text>
            <Text className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              {user.userType}
            </Text>

            <Text className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Phone Number
            </Text>
            <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {user.phoneNumber}
            </Text>
          </View>
        )}

        <TouchableOpacity
          className="h-12 rounded-xl bg-red-600 items-center justify-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
