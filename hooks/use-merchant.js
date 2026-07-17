"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE } from "@/components/shared/QueryProvider";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

/**
 * Fetch the current merchant's business profile.
 *
 * Replaces the 7 inline copies of the `["merchant-profile"]` query that were
 * pasted across analytics, billing, campaigns, coupons, coupons/new,
 * coupons/[id], and profile.
 *
 * @returns {object} useQuery result — `data` is the merchant object (or null)
 */
export function useMerchantProfile() {
  return useQuery({
    queryKey: qk.merchant.profile(),
    staleTime: STALE.profile,
    queryFn: async () => {
      const json = await apiFetch("/api/merchants/me");
      return json.data;
    },
  });
}
