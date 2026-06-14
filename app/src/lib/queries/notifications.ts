import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export type Notification = {
  id: string;
  user_id: string;
  scope: 'user' | 'org_broadcast' | 'platform';
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  data?: any;
  created_at: string;
};

export const useNotifications = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},scope.eq.platform`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
};

export const useUnreadNotificationCount = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['notifications_unread_count', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
};

const PAGE_SIZE = 10;

export const useInfiniteNotifications = () => {
  const user = useAuthStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: ['notifications_infinite', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},scope.eq.platform`)
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      return data as Notification[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!user,
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications_unread_count', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications_infinite', user?.id] });
    },
  });
};
