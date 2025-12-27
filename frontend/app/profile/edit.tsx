import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { SERVER_URL } from "../../lib/api";
import { useAuth } from "../../context/authContext";

export default function EditProfile() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [drivingLicense, setDrivingLicense] = useState(user?.drivingLicense || "");
  const [nationalId, setNationalId] = useState(user?.nationalId || "");
  const [avatar, setAvatar] = useState<any>(null);
  const [licenseFile, setLicenseFile] = useState<any>(null);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const pickLicenseFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setLicenseFile(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (phoneNumber.length < 11) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (user?.userType === "Driver") {
      if (!drivingLicense || drivingLicense.length < 16) {
        Alert.alert("Error", "Please enter a valid driving license");
        return;
      }
      if (!nationalId || nationalId.length < 10) {
        Alert.alert("Error", "Please enter a valid national ID");
        return;
      }
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      formData.append("userType", user?.userType || "Normal");

      // Add avatar if selected
      if (avatar) {
        if (avatar.file) {
          formData.append("avatar", avatar.file);
        } else {
          formData.append("avatar", {
            uri: avatar.uri,
            type: avatar.mimeType || "image/jpeg",
            name: avatar.fileName || `avatar_${Date.now()}.jpg`,
          } as any);
        }
      }

      // Add driver-specific fields
      if (user?.userType === "Driver") {
        formData.append("drivingLicense", drivingLicense);
        formData.append("nationalId", nationalId);

        if (licenseFile) {
          if (licenseFile.file) {
            formData.append("licenseFile", licenseFile.file);
          } else {
            formData.append("licenseFile", {
              uri: licenseFile.uri,
              type: licenseFile.mimeType || "image/jpeg",
              name: licenseFile.fileName || `license_${Date.now()}.jpg`,
            } as any);
          }
        }
      }

      const response = await api.post("/updateuser", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        await refreshUser();
        Alert.alert("Success", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

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
              Edit Profile
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickAvatar} className="relative">
            <View className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center border-4 border-white dark:border-neutral-800 shadow-lg">
              {avatar ? (
                <Image
                  source={{ uri: avatar.uri }}
                  style={{ width: 120, height: 120, borderRadius: 60 }}
                />
              ) : user?.avatar ? (
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
                  {user?.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full items-center justify-center border-2 border-white dark:border-neutral-800">
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            Tap to change avatar
          </Text>
        </View>

        {/* Form Fields */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
              Phone Number *
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
            />
          </View>

          {/* Driver-specific fields */}
          {user?.userType === "Driver" && (
            <>
              <View>
                <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  Driving License Number *
                </Text>
                <TextInput
                  value={drivingLicense}
                  onChangeText={setDrivingLicense}
                  placeholder="Enter driving license number"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
                />
              </View>

              <View>
                <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  National ID *
                </Text>
                <TextInput
                  value={nationalId}
                  onChangeText={setNationalId}
                  placeholder="Enter national ID"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700"
                />
              </View>

              <View>
                <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                  License File (Optional)
                </Text>
                <TouchableOpacity
                  onPress={pickLicenseFile}
                  className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 flex-row items-center justify-between"
                >
                  <Text className="text-neutral-600 dark:text-neutral-400">
                    {licenseFile ? "License file selected" : "Choose license file"}
                  </Text>
                  {licenseFile && (
                    <Image
                      source={{ uri: licenseFile.uri }}
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`mt-8 mb-6 py-4 rounded-xl ${
            loading ? "bg-neutral-400" : "bg-blue-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-center text-white text-lg font-bold">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
