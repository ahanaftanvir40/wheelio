import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
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

export default function PostDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get("/getposts");
      const posts = Array.isArray(response.data) ? response.data : [];
      const foundPost = posts.find((p: Post) => p._id === id);
      setPost(foundPost || null);
    } catch (error) {
      console.error("Error fetching post:", error);
      Alert.alert("Error", "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      Alert.alert("Error", "Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("authToken");
      await api.post(
        `/posts/${id}/comments`,
        { content: commentContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommentContent("");
      fetchPost();
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      Alert.alert("Error", "Please enter a reply");
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("authToken");
      await api.post(
        `/posts/${id}/comments/${commentId}/replies`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReplyContent("");
      setReplyingTo(null);
      fetchPost();
    } catch (error) {
      console.error("Error adding reply:", error);
      Alert.alert("Error", "Failed to add reply");
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

  const renderReply = (reply: Reply) => (
    <View
      key={reply._id}
      className="ml-12 mt-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3"
    >
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-6 h-6 rounded-full bg-green-600 items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {reply.userId.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
          {reply.userId.name}
        </Text>
        <Text className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(reply.createdAt)}
        </Text>
      </View>
      <Text className="text-neutral-700 dark:text-neutral-300 text-sm">
        {reply.content}
      </Text>
    </View>
  );

  const renderComment = (comment: Comment) => (
    <View
      key={comment._id}
      className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 mb-3"
    >
      {/* Comment Header */}
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
          <Text className="text-white text-sm font-bold">
            {comment.userId.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-neutral-900 dark:text-neutral-100">
            {comment.userId.name}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatDate(comment.createdAt)}
          </Text>
        </View>
      </View>

      {/* Comment Content */}
      <Text className="text-neutral-800 dark:text-neutral-200 mb-2">
        {comment.content}
      </Text>

      {/* Reply Button */}
      <TouchableOpacity
        onPress={() =>
          setReplyingTo(replyingTo === comment._id ? null : comment._id)
        }
        className="flex-row items-center gap-1 mt-1"
      >
        <Ionicons name="return-down-forward" size={14} color="#6B7280" />
        <Text className="text-xs text-neutral-600 dark:text-neutral-400">
          Reply
        </Text>
      </TouchableOpacity>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <View className="mt-2">
          {comment.replies.map((reply) => renderReply(reply))}
        </View>
      )}

      {/* Reply Input */}
      {replyingTo === comment._id && (
        <View className="mt-3">
          <TextInput
            value={replyContent}
            onChangeText={setReplyContent}
            placeholder="Write a reply..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="bg-white dark:bg-neutral-900 rounded-xl px-3 py-2 text-neutral-900 dark:text-neutral-100 mb-2"
          />
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleAddReply(comment._id)}
              disabled={submitting}
              className="flex-1 bg-blue-600 py-2 rounded-lg"
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-center text-white font-semibold text-sm">
                  Reply
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(null);
                setReplyContent("");
              }}
              className="px-4 bg-neutral-300 dark:bg-neutral-700 py-2 rounded-lg"
            >
              <Text className="text-center text-neutral-700 dark:text-neutral-300 font-semibold text-sm">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
            Post Not Found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Post
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Post */}
          <View className="bg-white dark:bg-neutral-900 p-6 border-b border-neutral-200 dark:border-neutral-800">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center">
                <Text className="text-white font-bold text-lg">
                  {post.userId.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="font-bold text-neutral-900 dark:text-neutral-100">
                  {post.userId.name}
                </Text>
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatDate(post.createdAt)}
                </Text>
              </View>
            </View>
            <Text className="text-neutral-800 dark:text-neutral-200 text-base leading-6">
              {post.content}
            </Text>
          </View>

          {/* Comments Section */}
          <View className="px-6 py-4">
            <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Comments ({post.comments.length})
            </Text>

            {post.comments.length > 0 ? (
              post.comments.map((comment) => renderComment(comment))
            ) : (
              <View className="items-center py-10">
                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                <Text className="text-neutral-600 dark:text-neutral-400 mt-2">
                  No comments yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Comment Input */}
        <View className="px-6 py-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <TextInput
            value={commentContent}
            onChangeText={setCommentContent}
            placeholder="Write a comment..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3 text-neutral-900 dark:text-neutral-100 mb-3"
            style={{ maxHeight: 100 }}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={submitting}
            className={`py-3 rounded-xl ${
              submitting ? "bg-neutral-400" : "bg-blue-600"
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-center text-white font-semibold">
                Add Comment
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
