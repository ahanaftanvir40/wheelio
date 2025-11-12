import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SlideCard from '../components/onboarding/SlideCard';
import Dots from '../components/onboarding/Dots';
import { slides } from '../constants/onboarding';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
      router.replace('/auth');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('onboardingSeen', 'true');
      router.replace('/auth');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'left', 'right']}>
      {/* Skip Button */}
      <View className="pt-4 pr-6 items-end">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-base font-semibold text-neutral-600 dark:text-neutral-400">
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <SlideCard slide={item} />
          </View>
        )}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom Section: Dots and Buttons */}
      <View className="px-6 pb-8">
        {/* Pagination Dots */}
        <View className="mb-8">
          <Dots total={slides.length} activeIndex={currentIndex} />
        </View>

        {/* Action Buttons */}
        {isLastSlide ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            className="h-14 rounded-xl bg-blue-600 items-center justify-center"
          >
            <Text className="text-white font-semibold text-base">
              Get Started
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            className="h-14 rounded-xl bg-blue-600 items-center justify-center"
          >
            <Text className="text-white font-semibold text-base">
              Next
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
