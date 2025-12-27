import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
  images: string[];
}

interface ChatPreview {
  vehicleId: string;
  ownerId: string;
  userId: string;
  username: string;
  vehicle: Vehicle;
  lastMessage?: string;
  timestamp?: string;
}

export default function Chats() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myVehicleChats, setMyVehicleChats] = useState<ChatPreview[]>([]);
  const [myInquiryChats, setMyInquiryChats] = useState<ChatPreview[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      // Get current user
      const userResponse = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userResponse.data._id;
      setCurrentUserId(userId);

      // Get user's vehicles
      const vehiclesResponse = await api.get("/my-vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const vehicles = vehiclesResponse.data.vehicles || [];

      // Get chats for each vehicle (where user is owner)
      const vehicleChatsPromises = vehicles.map(async (vehicle: Vehicle) => {
        try {
          const response = await api.get(
            `/ownerChats/${vehicle._id}/${userId}`
          );
          const { userIds, userNames } = response.data;

          return userIds.map((inquiryUserId: string, index: number) => ({
            vehicleId: vehicle._id,
            ownerId: userId,
            userId: inquiryUserId,
            username: userNames[index] || "User",
            vehicle,
          }));
        } catch (error) {
          return [];
        }
      });

      const vehicleChatsArrays = await Promise.all(vehicleChatsPromises);
      const allVehicleChats = vehicleChatsArrays.flat();
      setMyVehicleChats(allVehicleChats);

      // Get chats where user sent inquiries
      const userChatsResponse = await api.get(`/userChats/${userId}`);
      const userChats = userChatsResponse.data || [];

      // Fetch vehicle details for each chat
      const inquiryChatsPromises = userChats.map(async (chat: any) => {
        try {
          const vehicleResponse = await api.get(`/vehicles/${chat.vehicleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const ownerResponse = await api.get(`/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          return {
            vehicleId: chat.vehicleId,
            ownerId: chat.ownerId,
            userId: chat.userId,
            username: ownerResponse.data.name || "Owner",
            vehicle: vehicleResponse.data,
          };
        } catch (error) {
          return null;
        }
      });

      const inquiryChatsResults = await Promise.all(inquiryChatsPromises);
      const validInquiryChats = inquiryChatsResults.filter((chat) => chat !== null);
      setMyInquiryChats(validInquiryChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      Alert.alert("Error", "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (chat: ChatPreview) => {
    router.push(
      `/chats/${chat.vehicleId}/${chat.ownerId}/${chat.userId}` as any
    );
  };

  const renderChatItem = (chat: ChatPreview, isOwner: boolean) => (
    <TouchableOpacity
      key={`${chat.vehicleId}-${chat.userId}`}
      onPress={() => handleChatPress(chat)}
      className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center">
          <Ionicons name="person" size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-neutral-900 dark:text-neutral-100">
            {chat.username}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {chat.vehicle.brand} {chat.vehicle.model}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
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
              Messages
            </Text>
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">
              Chat with vehicle owners and renters
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("received")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "received"
                ? "bg-blue-600"
                : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "received"
                  ? "text-white"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Received ({myVehicleChats.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("sent")}
            className={`flex-1 py-3 rounded-xl ${
              activeTab === "sent"
                ? "bg-blue-600"
                : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "sent"
                  ? "text-white"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              Sent ({myInquiryChats.length})
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
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          {activeTab === "received" ? (
            myVehicleChats.length > 0 ? (
              myVehicleChats.map((chat) => renderChatItem(chat, true))
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <View className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-full items-center justify-center mb-4">
                  <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                </View>
                <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  No Messages
                </Text>
                <Text className="text-center text-neutral-600 dark:text-neutral-400">
                  You haven&apos;t received any inquiries yet
                </Text>
              </View>
            )
          ) : myInquiryChats.length > 0 ? (
            myInquiryChats.map((chat) => renderChatItem(chat, false))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-full items-center justify-center mb-4">
                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                No Messages
              </Text>
              <Text className="text-center text-neutral-600 dark:text-neutral-400">
                You haven&apos;t sent any inquiries yet
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
