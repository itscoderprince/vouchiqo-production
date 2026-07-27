"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useRealtime } from "./use-realtime";
import { useSocket } from "./use-socket";

/**
 * Hook for merchant application status + real-time updates + fallback polling.
 */
export function useApplicationStatus() {
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();

  const query = useQuery({
    queryKey: qk.merchant.applicationStatus(),
    queryFn: async () => {
      const json = await apiFetch("/api/merchant/application/status");
      return json.data || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    // Fallback to polling every 30s if socket is NOT connected
    refetchInterval: isConnected ? false : 30000,
  });

  // Listen for real-time application status change
  useRealtime(SOCKET_EVENTS.APPLICATION_STATUS_CHANGED, (data) => {
    if (data?.status) {
      queryClient.setQueryData(qk.merchant.applicationStatus(), (old) => {
        if (!old) return old;
        const isApproved = data.status === "approved";
        const isRejected = data.status === "rejected";
        const isPending = data.status === "pending";
        const progressPercentage = isApproved
          ? 100
          : isRejected
            ? 50
            : isPending
              ? 33
              : 66;

        return {
          ...old,
          status: data.status,
          progressPercentage,
          rejectionReason: data.rejectionReason || old.rejectionReason,
          lastUpdatedAt: new Date().toISOString(),
        };
      });

      // Invalidate to ensure consistent server state
      queryClient.invalidateQueries({
        queryKey: qk.merchant.applicationStatus(),
      });
    }
  });

  return {
    ...query,
    application: query.data,
    isConnected,
  };
}
