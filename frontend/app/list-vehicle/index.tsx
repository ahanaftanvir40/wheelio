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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../lib/api";

export default function ListVehicle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [type, setType] = useState<"Car" | "Bike">("Car");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [noPlate, setNoPlate] = useState("");
  const [chassisNo, setChassisNo] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState(true);
  const [images, setImages] = useState<any[]>([]);

  // Error state
  const [errors, setErrors] = useState<any>({});

  // Categories based on vehicle type
  const carCategories = [
    "Sedan",
    "SUV",
    "Sports Car",
    "Wagon",
    "MiniVan",
    "Convertible",
  ];
  const bikeCategories = [
    "Commuter Bike",
    "Sports Bike",
    "Cruiser Bike",
    "Scooter",
  ];

  const categories = type === "Car" ? carCategories : bikeCategories;

  // Modal state for category selection
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Image picker
  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can only upload up to 5 images");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = () => {
    const newErrors: any = {};

    if (!brand.trim()) newErrors.brand = "Brand is required";
    if (!model.trim()) newErrors.model = "Model is required";
    if (!year.trim()) newErrors.year = "Year is required";
    else if (
      parseInt(year) < 1900 ||
      parseInt(year) > new Date().getFullYear() + 1
    ) {
      newErrors.year = "Please enter a valid year";
    }
    if (!pricePerDay.trim()) newErrors.pricePerDay = "Price is required";
    else if (parseFloat(pricePerDay) <= 0) {
      newErrors.pricePerDay = "Price must be greater than 0";
    }
    if (!location.trim()) newErrors.location = "Location is required";
    if (!category) newErrors.category = "Category is required";
    if (!condition.trim()) newErrors.condition = "Condition is required";
    if (!noPlate.trim()) newErrors.noPlate = "License plate is required";
    if (!chassisNo.trim()) newErrors.chassisNo = "Chassis number is required";
    if (!registrationNo.trim())
      newErrors.registrationNo = "Registration number is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please login to continue");
        router.replace("/auth");
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("type", type);
      formData.append("brand", brand);
      formData.append("model", model);
      formData.append("year", year);
      formData.append("pricePerDay", pricePerDay);
      formData.append("location", location);
      formData.append("category", category);
      formData.append("condition", condition);
      formData.append("no_plate", noPlate);
      formData.append("chassis_no", chassisNo);
      formData.append("registration_no", registrationNo);
      formData.append("description", description);
      formData.append("availability", availability.toString());

      // Add images
      images.forEach((image, index) => {
        const imageFile: any = {
          uri: image.uri,
          type: "image/jpeg",
          name: `vehicle_${Date.now()}_${index}.jpg`,
        };
        formData.append("vehicleImages", imageFile);
      });

      const response = await api.post("/vehicles", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Vehicle listed successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.data.message || "Failed to list vehicle");
      }
    } catch (error: any) {
      console.error("Error listing vehicle:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to list vehicle"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            List Your Vehicle
          </Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* Vehicle Type Toggle */}
          <View>
            <Text className="text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
              Vehicle Type *
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 h-12 rounded-xl items-center justify-center ${
                  type === "Car"
                    ? "bg-blue-600"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
                onPress={() => {
                  setType("Car");
                  setCategory("");
                }}
              >
                <Text
                  className={`font-semibold ${
                    type === "Car"
                      ? "text-white"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  Car
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 h-12 rounded-xl items-center justify-center ${
                  type === "Bike"
                    ? "bg-blue-600"
                    : "bg-neutral-200 dark:bg-neutral-800"
                }`}
                onPress={() => {
                  setType("Bike");
                  setCategory("");
                }}
              >
                <Text
                  className={`font-semibold ${
                    type === "Bike"
                      ? "text-white"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  Bike
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Brand */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Brand *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., Toyota, Honda"
              placeholderTextColor="#9ca3af"
              value={brand}
              onChangeText={setBrand}
            />
            {errors.brand && (
              <Text className="text-red-500 text-xs mt-1">{errors.brand}</Text>
            )}
          </View>

          {/* Model */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Model *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., Camry, Civic"
              placeholderTextColor="#9ca3af"
              value={model}
              onChangeText={setModel}
            />
            {errors.model && (
              <Text className="text-red-500 text-xs mt-1">{errors.model}</Text>
            )}
          </View>

          {/* Year */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Year *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., 2020"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />
            {errors.year && (
              <Text className="text-red-500 text-xs mt-1">{errors.year}</Text>
            )}
          </View>

          {/* Category */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Category *
            </Text>
            <TouchableOpacity
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex-row items-center justify-between"
              onPress={() => setShowCategoryModal(true)}
            >
              <Text className={category ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}>
                {category || "Select category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
            {errors.category && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.category}
              </Text>
            )}
          </View>

          {/* Price Per Day */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Price Per Day (BDT) *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., 5000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={pricePerDay}
              onChangeText={setPricePerDay}
            />
            {errors.pricePerDay && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.pricePerDay}
              </Text>
            )}
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Location *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., Dhaka, Bangladesh"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />
            {errors.location && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.location}
              </Text>
            )}
          </View>

          {/* Condition */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Condition *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., Excellent, Good, Fair"
              placeholderTextColor="#9ca3af"
              value={condition}
              onChangeText={setCondition}
            />
            {errors.condition && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.condition}
              </Text>
            )}
          </View>

          {/* License Plate */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              License Plate Number *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="e.g., DHA-1234"
              placeholderTextColor="#9ca3af"
              value={noPlate}
              onChangeText={setNoPlate}
            />
            {errors.noPlate && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.noPlate}
              </Text>
            )}
          </View>

          {/* Chassis Number */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Chassis Number *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="Enter chassis number"
              placeholderTextColor="#9ca3af"
              value={chassisNo}
              onChangeText={setChassisNo}
            />
            {errors.chassisNo && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.chassisNo}
              </Text>
            )}
          </View>

          {/* Registration Number */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Registration Number *
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="Enter registration number"
              placeholderTextColor="#9ca3af"
              value={registrationNo}
              onChangeText={setRegistrationNo}
            />
            {errors.registrationNo && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.registrationNo}
              </Text>
            )}
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Description (Optional)
            </Text>
            <TextInput
              className="h-24 px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
              placeholder="Add any additional details about your vehicle"
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Vehicle Images */}
          <View>
            <Text className="text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
              Vehicle Images * (Max 5)
            </Text>
            <TouchableOpacity
              className="h-32 rounded-xl bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-700 items-center justify-center"
              onPress={pickImages}
            >
              <Ionicons name="cloud-upload-outline" size={40} color="#9ca3af" />
              <Text className="text-neutral-500 dark:text-neutral-400 mt-2">
                Tap to upload images
              </Text>
              <Text className="text-neutral-400 dark:text-neutral-500 text-xs mt-1">
                {images.length}/5 images selected
              </Text>
            </TouchableOpacity>
            {errors.images && (
              <Text className="text-red-500 text-xs mt-1">{errors.images}</Text>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {images.map((image, index) => (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri: image.uri }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <TouchableOpacity
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="h-14 rounded-xl bg-blue-600 items-center justify-center mt-4"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                List Vehicle
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-neutral-900 rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Select Category
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`h-12 px-4 rounded-xl mb-2 flex-row items-center justify-between ${
                    category === cat
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    className={`font-semibold ${
                      category === cat
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {cat}
                  </Text>
                  {category === cat && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
