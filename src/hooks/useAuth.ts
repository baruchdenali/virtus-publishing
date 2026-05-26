import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: kimiUser,
    isLoading: kimiLoading,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const {
    data: kindeUser,
    isLoading: kindeLoading,
  } = trpc.kinde.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const kindeLogoutMutation = trpc.kinde.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
    kindeLogoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation, kindeLogoutMutation]);

  const user = kimiUser || kindeUser || null;
  const isLoading = kimiLoading || kindeLoading;
  const isAuthenticated = !!user;

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading: isLoading || logoutMutation.isPending || kindeLogoutMutation.isPending,
      logout,
      refresh: () => utils.invalidate(),
    }),
    [user, isAuthenticated, isLoading, logoutMutation.isPending, kindeLogoutMutation.isPending, logout, utils],
  );
}
