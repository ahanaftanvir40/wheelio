import React from 'react';
import { View, Text, Image, useColorScheme } from 'react-native';
import { OnboardingSlide } from '../../constants/onboarding';

interface SlideCardProps {
  slide: OnboardingSlide;
}

export default function SlideCard({ slide }: SlideCardProps) {
  const colorScheme = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Image
        source={slide.image}
        className="w-64 h-64 mb-8"
        resizeMode="contain"
      />
      <Text className="text-3xl font-bold text-center mb-4 text-neutral-900 dark:text-neutral-100">
        {slide.title}
      </Text>
      <Text className="text-base text-center text-neutral-600 dark:text-neutral-400">
        {slide.text}
      </Text>
    </View>
  );
}
