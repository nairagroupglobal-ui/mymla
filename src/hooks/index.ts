// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { AuthUser, AuthSession } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error);
      if (data.session) {
        setSession(data.session as unknown as AuthSession);
        setUser(data.session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session as unknown as AuthSession);
        setUser(session.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return { user, session, loading, error, signUp, signIn, signOut, resetPassword };
}

// src/hooks/useSubmissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsAPI } from '@/api/client';
import type { Submission, ListFilters } from '@/types';

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await submissionsAPI.getById(id);
      if (error) throw error;
      return data;
    },
  });
}

export function useCitizenSubmissions(citizenId: string, filters?: ListFilters) {
  return useQuery({
    queryKey: ['submissions', 'citizen', citizenId, filters],
    queryFn: async () => {
      const { data, error } = await submissionsAPI.listByCitizen(citizenId, filters);
      if (error) throw error;
      return data;
    },
    enabled: !!citizenId,
  });
}

export function useReviewSubmissions(reviewerId: string, filters?: ListFilters) {
  return useQuery({
    queryKey: ['submissions', 'review', reviewerId, filters],
    queryFn: async () => {
      const { data, error } = await submissionsAPI.listForReview(reviewerId, filters);
      if (error) throw error;
      return data;
    },
    enabled: !!reviewerId,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Submission>) => submissionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Submission> }) =>
      submissionsAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['submission', data.id] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

// src/hooks/useNotifications.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { notificationsAPI } from '@/api/client';

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await notificationsAPI.listByUser(userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return { notifications: data || [], isLoading };
}

// src/hooks/useRealtimeSubmissions.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

export function useRealtimeSubmissions(submissionId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!submissionId) return;

    const channel = supabase
      .channel(`submissions:${submissionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `id=eq.${submissionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [submissionId, queryClient]);
}

// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesAPI } from '@/api/client';
import type { Profile } from '@/types';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await profilesAPI.getById(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<Profile> }) =>
      profilesAPI.update(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    },
  });
}
