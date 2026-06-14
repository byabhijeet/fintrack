import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuthStore } from '../../store/authStore';

export const useSubscriptionCheck = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['subscription-check', user?.id],
    queryFn: async () => {
      if (!user) return false;

      try {
        // Check 1: Personal User Plan
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select(`
            plan_status,
            plans ( level, name )
          `)
          .eq('auth_id', user.id)
          .single();

        if (!accountError && accountData) {
          const { plan_status, plans } = accountData as any;
          if ((plan_status === 'active' || plan_status === 'trialing') && plans) {
            if (plans.level >= 1 || plans.name.toLowerCase().includes('premium') || plans.name.toLowerCase().includes('level')) {
              return true;
            }
          }
        }

        // Check 2: Merchant User Plan via org membership
        const { data: orgMembers, error: orgError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (!orgError && orgMembers && orgMembers.length > 0) {
          for (const member of orgMembers) {
            const { data: subData, error: subError } = await supabase
              .from('subscriptions')
              .select(`
                status,
                plans ( level, name )
              `)
              .eq('organization_id', member.organization_id)
              .in('status', ['active', 'trialing']);

            if (!subError && subData && subData.length > 0) {
              for (const sub of subData as any[]) {
                if (sub.plans && (sub.plans.level >= 1 || sub.plans.name.toLowerCase().includes('premium') || sub.plans.name.toLowerCase().includes('level'))) {
                  return true;
                }
              }
            }
          }
        }

        return false;
      } catch (error) {
        console.error('Subscription check error:', error);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
