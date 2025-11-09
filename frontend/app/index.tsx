import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');
      
      // Small delay for splash effect
      setTimeout(() => {
        if (onboardingSeen === 'true') {
          router.replace('/auth');
        } else {
          router.replace('/onboarding');
        }
      }, 1000);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding on error
      router.replace('/onboarding');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
