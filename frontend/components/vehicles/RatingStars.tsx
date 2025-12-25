import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showNumber?: boolean;
  color?: string;
}

export default function RatingStars({
  rating,
  maxStars = 5,
  size = 16,
  showNumber = true,
  color = "#F59E0B",
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View className="flex-row items-center gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, index) => (
        <Ionicons key={`full-${index}`} name="star" size={size} color={color} />
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <Ionicons name="star-half" size={size} color={color} />
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <Ionicons
          key={`empty-${index}`}
          name="star-outline"
          size={size}
          color={color}
        />
      ))}

      {/* Rating Number */}
      {showNumber && (
        <Text className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
