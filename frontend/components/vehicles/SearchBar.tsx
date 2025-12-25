import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  onSearch,
  placeholder = "Search brand, model, location...",
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3 shadow-sm">
      <Ionicons
        name="search"
        size={20}
        className="text-neutral-400 dark:text-neutral-500"
        color="#9CA3AF"
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-3 text-base text-neutral-900 dark:text-neutral-100"
        onSubmitEditing={onSearch}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
