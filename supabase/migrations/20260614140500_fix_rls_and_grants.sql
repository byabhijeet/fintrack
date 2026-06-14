-- ==============================================================================
-- FIX 1: Grant Permissions for recurring_transactions
-- ==============================================================================
-- The migration created the table and enabled RLS but forgot to grant
-- access to the authenticated and anon roles, leading to the 42501 error.

GRANT ALL ON TABLE public.recurring_transactions TO authenticated;
GRANT ALL ON TABLE public.recurring_transactions TO anon;
GRANT ALL ON TABLE public.recurring_transactions TO service_role;


-- ==============================================================================
-- FIX 2: Break Infinite Recursion in split_groups and split_group_members
-- ==============================================================================
-- The split_groups SELECT policy queries split_group_members, which in turn
-- has a SELECT policy querying split_groups. This circular dependency causes
-- the "infinite recursion detected in policy" (42P17) error.
-- We fix this by replacing the recursive queries with SECURITY DEFINER functions.

-- 1. Drop the offending recursive policies
DROP POLICY IF EXISTS "split_groups_member_read" ON public.split_groups;
DROP POLICY IF EXISTS "split_group_members_group_read" ON public.split_group_members;

-- 2. Create helper functions that bypass RLS to read group memberships safely
CREATE OR REPLACE FUNCTION public.get_user_split_group_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT group_id FROM public.split_group_members WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_creator_split_group_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.split_groups WHERE creator_id = p_user_id;
$$;

-- 3. Recreate the policies using the safe helper functions
CREATE POLICY "split_groups_member_read" ON public.split_groups
  FOR SELECT USING (
    id IN (SELECT public.get_user_split_group_ids(auth.uid()))
  );

CREATE POLICY "split_group_members_group_read" ON public.split_group_members
  FOR SELECT USING (
    group_id IN (SELECT public.get_creator_split_group_ids(auth.uid()))
  );
