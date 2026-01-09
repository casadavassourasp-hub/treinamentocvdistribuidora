-- Fix: Restrict user_roles SELECT to prevent role enumeration
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view roles" ON public.user_roles;

-- Create policy allowing users to view only their own role
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Create policy allowing admins to view all roles (needed for user management)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));