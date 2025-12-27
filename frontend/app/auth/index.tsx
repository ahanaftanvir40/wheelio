import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/authContext";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState<"Normal" | "Driver">("Normal");

  // Driver-specific fields
  const [drivingLicense, setDrivingLicense] = useState("");
  const [nationalId, setNationalId] = useState("");

  // File uploads
  const [avatar, setAvatar] = useState<any>(null);
  const [licenseFile, setLicenseFile] = useState<any>(null);

  // Error state
  const [error, setError] = useState("");

  // Image picker for avatar
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

  // Image picker for license file
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

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSignupForm = () => {
    if (!signupName.trim()) {
      setError("Name is required");
      return false;
    }
    if (!validateEmail(signupEmail)) {
      setError("Please enter a valid email");
      return false;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (phoneNumber.length < 11) {
      setError("Please enter a valid phone number (min 11 digits)");
      return false;
    }

    // Driver-specific validation
    if (userType === "Driver") {
      if (!drivingLicense || drivingLicense.length < 16) {
        setError("Please enter a valid driving license (min 16 characters)");
        return false;
      }
      if (!nationalId || nationalId.length < 10) {
        setError("Please enter a valid national ID (min 10 characters)");
        return false;
      }
      if (!licenseFile) {
        setError("License file is required for drivers");
        return false;
      }
    }

    return true;
  };

  const validateLoginForm = () => {
    if (!validateEmail(loginEmail)) {
      setError("Please enter a valid email");
      return false;
    }
    if (!loginPassword) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  // Handle Login
  const handleLogin = async () => {
    setError("");
    if (!validateLoginForm()) return;

    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Login successful!");
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
  };

  // Handle Signup
  const handleSignup = async () => {
    setError("");
    if (!validateSignupForm()) return;

    setLoading(true);

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append("name", signupName);
    formData.append("email", signupEmail);
    formData.append("password", signupPassword);
    formData.append("phoneNumber", phoneNumber);
    formData.append("userType", userType);

    // Add avatar if selected
    if (avatar) {
      // For web, use the File object directly; for mobile, use the URI format
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
    if (userType === "Driver") {
      formData.append("drivingLicense", drivingLicense);
      formData.append("nationalId", nationalId);

      if (licenseFile) {
        // For web, use the File object directly; for mobile, use the URI format
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

    const result = await signup(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Account created successfully! Please login.");
      setIsLogin(true);
      clearSignupForm();
    } else {
      setError(result.errors || result.message || "Signup failed. Please try again.");
    }
  };

  const clearSignupForm = () => {
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setConfirmPassword("");
    setPhoneNumber("");
    setUserType("Normal");
    setDrivingLicense("");
    setNationalId("");
    setAvatar(null);
    setLicenseFile(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 py-8">
          <View className="w-full max-w-md">
            <Text className="text-4xl font-bold text-center mb-2 text-neutral-900 dark:text-neutral-100">
              Welcome to Wheelio
            </Text>
            <Text className="text-base text-center mb-8 text-neutral-600 dark:text-neutral-400">
              {isLogin ? "Sign in to continue" : "Create your account"}
            </Text>

            {error ? (
              <View className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg mb-4">
                <Text className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            {isLogin ? (
              // LOGIN FORM
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Email
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Password
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                  />
                </View>

                <TouchableOpacity
                  className="h-12 rounded-xl bg-blue-600 items-center justify-center mt-4"
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // SIGNUP FORM
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Name
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your name"
                    placeholderTextColor="#9ca3af"
                    value={signupName}
                    onChangeText={setSignupName}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Email
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Phone Number
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your phone number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Password
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Confirm Password
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                {/* User Type Selection */}
                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    User Type
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className={`flex-1 h-12 rounded-xl items-center justify-center ${
                        userType === "Normal"
                          ? "bg-blue-600"
                          : "bg-neutral-100 dark:bg-neutral-900"
                      }`}
                      onPress={() => setUserType("Normal")}
                    >
                      <Text
                        className={`font-semibold ${
                          userType === "Normal"
                            ? "text-white"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        Normal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 h-12 rounded-xl items-center justify-center ${
                        userType === "Driver"
                          ? "bg-blue-600"
                          : "bg-neutral-100 dark:bg-neutral-900"
                      }`}
                      onPress={() => setUserType("Driver")}
                    >
                      <Text
                        className={`font-semibold ${
                          userType === "Driver"
                            ? "text-white"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        Driver
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Avatar Upload */}
                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Avatar (Optional)
                  </Text>
                  <TouchableOpacity
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex-row items-center justify-between"
                    onPress={pickAvatar}
                  >
                    <Text className="text-neutral-600 dark:text-neutral-400">
                      {avatar ? "Avatar selected" : "Choose avatar"}
                    </Text>
                    {avatar && (
                      <Image
                        source={{ uri: avatar.uri }}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Driver-specific fields */}
                {userType === "Driver" && (
                  <>
                    <View>
                      <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                        Driving License Number
                      </Text>
                      <TextInput
                        className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        placeholder="Enter driving license number"
                        placeholderTextColor="#9ca3af"
                        value={drivingLicense}
                        onChangeText={setDrivingLicense}
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                        National ID
                      </Text>
                      <TextInput
                        className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        placeholder="Enter national ID"
                        placeholderTextColor="#9ca3af"
                        value={nationalId}
                        onChangeText={setNationalId}
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                        License File *
                      </Text>
                      <TouchableOpacity
                        className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex-row items-center justify-between"
                        onPress={pickLicenseFile}
                      >
                        <Text className="text-neutral-600 dark:text-neutral-400">
                          {licenseFile
                            ? "License file selected"
                            : "Choose license file"}
                        </Text>
                        {licenseFile && (
                          <Image
                            source={{ uri: licenseFile.uri }}
                            className="w-8 h-8 rounded"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <TouchableOpacity
                  className="h-12 rounded-xl bg-blue-600 items-center justify-center mt-4"
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Sign Up
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="items-center mt-4"
            >
              <Text className="text-neutral-600 dark:text-neutral-400">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Text className="text-blue-600 font-semibold">
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
