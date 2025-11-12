import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-full max-w-md">
            <Text className="text-4xl font-bold text-center mb-2 text-neutral-900 dark:text-neutral-100">
              Welcome to Wheelio
            </Text>
            <Text className="text-base text-center mb-8 text-neutral-600 dark:text-neutral-400">
              {isLogin ? "Sign in to continue" : "Create your account"}
            </Text>

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
                />
              </View>

              {!isLogin && (
                <View>
                  <Text className="text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                    Confirm Password
                  </Text>
                  <TextInput
                    className="h-12 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                  />
                </View>
              )}

              <TouchableOpacity className="h-12 rounded-xl bg-blue-600 items-center justify-center mt-4">
                <Text className="text-white font-semibold text-base">
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
