import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../theme';
import {
  useInfiniteNotifications,
  useMarkAsReadMutation,
  useUnreadNotificationCount,
  Notification
} from '../../../lib/queries/notifications';
import { useNotificationStore } from '../../../store/notificationStore';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, BellDot } from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';

export default function ActivityScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching,
  } = useInfiniteNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkAsReadMutation();
  const { setUnreadCount, incrementUnread, decrementUnread } = useNotificationStore();

  const notifications = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);

  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  useEffect(() => {
    if (!user) return;

    // Realtime Subscription - Use a unique channel name per mount to prevent callback registration errors
    const channelId = `notifications-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['notifications_unread_count', user.id] });
          queryClient.invalidateQueries({ queryKey: ['notifications_infinite', user.id] });
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

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && !isRefetching) {
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
      <Stack.Screen options={{ title: 'Activity & Alerts' }} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
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
