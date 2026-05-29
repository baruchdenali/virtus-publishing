import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.localAuth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      window.location.reload();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return useMemo(
    () => ({
      user: user || null,
      isAuthenticated,
      isAdmin,
      isLoading: isLoading || logoutMutation.isPending,
      logout,
      refresh: () => utils.invalidate(),
    }),
    [user, isAuthenticated, isAdmin, isLoading, logoutMutation.isPending, logout, utils],
  );
}
