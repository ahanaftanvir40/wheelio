import React from 'react';
import { View } from 'react-native';

interface DotsProps {
  total: number;
  activeIndex: number;
}

export default function Dots({ total, activeIndex }: DotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full ${
            index === activeIndex
              ? 'w-8 bg-blue-600'
              : 'w-2 bg-neutral-300 dark:bg-neutral-700'
          }`}
        />
      ))}
    </View>
  );
}
