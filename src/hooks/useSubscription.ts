import { trpc } from "@/providers/trpc";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading } = trpc.user.subscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Admin/ops always have access (bypass subscription)
  const isAdmin = user?.role === "admin" || user?.role === "operations" || user?.role === "sales";
  const hasActiveSubscription = isAdmin || (data?.hasActiveSubscription ?? false);
  const tier = data?.tier ?? null;

  return {
    hasActiveSubscription,
    tier,
    status: data?.status ?? null,
    expiresAt: data?.expiresAt ?? null,
    cancelAtPeriodEnd: data?.cancelAtPeriodEnd ?? false,
    isLoading,
    isAdmin,
  };
}
