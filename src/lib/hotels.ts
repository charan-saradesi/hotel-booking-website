import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  region?: string | null;
  description: string;
  star_rating: number;
  amenities: string[];
  cover_image: string;
}

export function resolveImage(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("hotel-images").getPublicUrl(path);
  return data.publicUrl;
}

export function formatUSD(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface HotelsListFilters {
  destination?: string;
  region?: string;
}

export function hotelsListQuery(filters: HotelsListFilters = {}) {
  return queryOptions({
    queryKey: ["hotels", "list", filters],
    queryFn: async (): Promise<Hotel[]> => {
      let query = supabase.from("hotels").select("*");

      const term = filters.region || filters.destination;
      if (term) {
        query = query.or(
            `city.ilike.%${term}%,region.ilike.%${term}%,country.ilike.%${term}%`
        );
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Hotel[];
    },
  });
}