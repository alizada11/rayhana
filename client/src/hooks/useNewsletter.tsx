import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  subscribeNewsletter,
  getNewsletterSubscriptions,
  exportNewsletterCsv,
  type NewsletterSubscription,
} from "@/lib/api";

export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: (payload: { email: string; country?: string }) =>
      subscribeNewsletter(payload.email, payload.country),
  });
};

export const useNewsletterSubscriptions = (filters: {
  from?: string;
  to?: string;
  country?: string;
  search?: string;
}) => {
  return useInfiniteQuery<{ items: NewsletterSubscription[]; nextCursor: string | null }>(
    {
      queryKey: ["newsletter-subscriptions", filters],
      initialPageParam: null as string | null,
      queryFn: ({ pageParam }) =>
        getNewsletterSubscriptions({
          ...filters,
          cursor: (pageParam as string | null | undefined) ?? null,
          limit: 20,
        }),
      getNextPageParam: last => last.nextCursor,
    }
  );
};

export const useExportNewsletterCsv = () => {
  return useMutation({
    mutationFn: exportNewsletterCsv,
  });
};
