import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../lib/api";

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Reply {
  _id: string;
  userId: User;
  content: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: User;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  comments: Comment[];
  createdAt: string;
}

export default function WheelioHub() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getposts");
      setPosts(Array.isArray(response.data) ? response.data.reverse() : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Please enter some content");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("authToken");
      await api.post(
        "/posts",
        { content: newPostContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewPostContent("");
      setShowNewPost(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderPost = (post: Post) => (
    <View
      key={post._id}
      className="bg-white dark:bg-neutral-800 rounded-2xl p-4 mb-4 shadow-sm"
    >
      {/* Post Header */}
      <View className="flex-row items-center gap-3 mb-3">
        <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
          <Text className="text-white font-bold">
            {post.userId.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
            {post.userId.name}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatDate(post.createdAt)}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <Text className="text-neutral-800 dark:text-neutral-200 mb-3 leading-5">
        {post.content}
      </Text>

      {/* Post Actions */}
      <View className="flex-row items-center gap-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <TouchableOpacity
          onPress={() => router.push(`/wheelhub/${post._id}` as any)}
          className="flex-row items-center gap-1"
        >
          <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                WheelioHub
              </Text>
              <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                Community discussions
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowNewPost(!showNewPost)}
            className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center"
          >
            <Ionicons
              name={showNewPost ? "close" : "add"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* New Post Input */}
      {showNewPost && (
        <View className="bg-white dark:bg-neutral-900 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <TextInput
            value={newPostContent}
            onChangeText={setNewPostContent}
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 mb-3"
            style={{ textAlignVertical: "top" }}
          />
          <TouchableOpacity
            onPress={handleCreatePost}
            disabled={submitting}
            className={`py-3 rounded-xl ${
              submitting ? "bg-neutral-400" : "bg-blue-600"
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-center text-white font-semibold">
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Posts List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 py-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
        >
          {posts.length > 0 ? (
            posts.map((post) => renderPost(post))
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-full items-center justify-center mb-4">
                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                No Posts Yet
              </Text>
              <Text className="text-center text-neutral-600 dark:text-neutral-400">
                Be the first to share something with the community!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
