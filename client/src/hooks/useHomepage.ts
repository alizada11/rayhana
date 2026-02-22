import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type HomepagePayload = {
  seo: Record<string, any>;
  home: Record<string, any>;
  settings: Record<string, any>;
  contact: Record<string, any>;
  faq: Record<string, any>;
  blogs: Array<{
    id: string;
    title: any;
    slug: string;
    imageUrl?: string | null;
    excerpt?: any;
    publishedAt?: string | null;
  }>;
  gallery: Array<{
    id: string;
    imageUrl?: string | null;
  }>;
};

export function useHomepage() {
  return useQuery({
    queryKey: ["homepage"],
    queryFn: async () => (await api.get<HomepagePayload>("/homepage")).data,
    staleTime: 5 * 60 * 1000,
  });
}
