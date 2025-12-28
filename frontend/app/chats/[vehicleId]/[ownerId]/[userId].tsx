import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { SERVER_URL } from "../../../../lib/api";
import io from "socket.io-client";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.replace("/api", "") || "http://192.168.31.187:3000";

interface Message {
  message: string;
  senderId: string;
  username: string;
  timestamp: string;
}

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  images: string[];
  pricePerDay: number;
}

export default function ChatRoom() {
  const router = useRouter();
  const { vehicleId, ownerId, userId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup socket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      // Get current user
      const userResponse = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUserId(userResponse.data._id);
      setCurrentUsername(userResponse.data.name);

      // Get vehicle details
      const vehicleResponse = await api.get(`/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicle(vehicleResponse.data);

      // Load existing messages
      const messagesResponse = await api.get(
        `/chat/${vehicleId}/${ownerId}/${userId}`
      );
      setMessages(messagesResponse.data || []);

      // Initialize Socket.IO
      socketRef.current = io(SOCKET_URL);

      // Join room
      socketRef.current.emit("join", { vehicleId, ownerId, userId });

      // Listen for new messages
      socketRef.current.on("message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });
    } catch (error) {
      console.error("Error initializing chat:", error);
      Alert.alert("Error", "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId) return;

    const messageData = {
      vehicleId,
      ownerId,
      userId,
      message: newMessage,
      senderId: currentUserId,
      username: currentUsername,
    };

    // Emit message via Socket.IO
    if (socketRef.current) {
      socketRef.current.emit("message", messageData);
    }

    setNewMessage("");
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message, index: number) => {
    const isOwnMessage = message.senderId === currentUserId;

    return (
      <View
        key={index}
        className={`mb-3 ${isOwnMessage ? "items-end" : "items-start"}`}
      >
        {!isOwnMessage && (
          <Text className="text-xs text-neutral-600 dark:text-neutral-400 mb-1 ml-2">
            {message.username}
          </Text>
        )}
        <View
          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
            isOwnMessage ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"
          }`}
        >
          <Text
            className={`${
              isOwnMessage
                ? "text-white"
                : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {message.message}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isOwnMessage ? "text-blue-100" : "text-neutral-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Chat
              </Text>
              <Text className="text-xs text-neutral-600 dark:text-neutral-400">
                {currentUserId === ownerId ? "Customer inquiry" : "Owner chat"}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Banner */}
        {vehicle && (
          <TouchableOpacity
            onPress={() => router.push(`/vehicles/${vehicleId}` as any)}
            className="bg-blue-50 dark:bg-blue-900/20 mx-6 mt-4 rounded-2xl p-3 border border-blue-200 dark:border-blue-800"
          >
            <View className="flex-row items-center gap-3">
              {vehicle.images && vehicle.images.length > 0 ? (
                <Image
                  source={{
                    uri: `${SERVER_URL}/public/images/vehicle-images/${vehicle.images[0]}`,
                  }}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                />
              ) : (
                <View className="w-15 h-15 bg-blue-200 dark:bg-blue-800 rounded-xl items-center justify-center">
                  <Ionicons name="car-sport" size={32} color="#3B82F6" />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-bold text-neutral-900 dark:text-neutral-100">
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text className="text-sm text-blue-600 dark:text-blue-400">
                  ৳{vehicle.pricePerDay}/day
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </View>
          </TouchableOpacity>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-6 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.length > 0 ? (
            messages.map((message, index) => renderMessage(message, index))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text className="text-neutral-600 dark:text-neutral-400 mt-4">
                No messages yet. Start the conversation!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <View className="flex-row items-center gap-2">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 text-neutral-900 dark:text-neutral-100"
              style={{ maxHeight: 100 }}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                newMessage.trim() ? "bg-blue-600" : "bg-neutral-300"
              }`}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? "white" : "#6B7280"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
