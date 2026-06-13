import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';
import { useNotifications, useMarkAsReadMutation, Notification } from '../../../lib/queries/notifications';
import { useNotificationStore } from '../../../store/notificationStore';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, BellDot } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ActivityScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsReadMutation();
  const { setUnreadCount, incrementUnread, decrementUnread } = useNotificationStore();

  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [notifications, setUnreadCount]);

  useEffect(() => {
    if (!user) return;

    // Realtime Subscription
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`, // Filtering by user directly in JS below to also catch platform events
        },
        (payload) => {
          console.log('New notification:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          incrementUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, incrementUnread]);

  const handleNotificationPress = async (item: Notification) => {
    if (!item.is_read) {
      await markAsReadMutation.mutateAsync(item.id);
      decrementUnread();
    }

    // In a real app, handle link navigation here
    // if (item.link) router.push(item.link);
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        {item.is_read ? (
          <Bell size={24} color={theme.colors.textSecondary} />
        ) : (
          <BellDot size={24} color={theme.colors.primary} />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity & Alerts</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>No notifications right now.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.text,
  },
  listContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unreadCard: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(30, 215, 96, 0.05)',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  unreadText: {
    color: theme.colors.primary,
  },
  message: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  time: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
});
