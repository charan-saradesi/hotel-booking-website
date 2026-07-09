import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchBar } from "@/components/search-bar";
import { HotelCard } from "@/components/hotel-card";
import { hotelsListQuery } from "@/lib/hotels";

export default function Search() {
    const [searchParams] = useSearchParams();
    const destination = searchParams.get("destination") ?? undefined;
    const region = searchParams.get("region") ?? undefined;
    const checkIn = searchParams.get("checkIn") ?? undefined;
    const checkOut = searchParams.get("checkOut") ?? undefined;
    const guests = searchParams.get("guests") ?? undefined;

    const { data, isLoading } = useQuery(hotelsListQuery({ destination, region }));

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />

            <section className="border-b border-border bg-secondary/30 py-10">
                <div className="mx-auto max-w-7xl px-6">
                    <h1 className="font-display text-3xl md:text-4xl">
                        {destination
                            ? `Stays in ${destination}`
                            : region
                                ? `Stays in ${region}`
                                : "All stays"}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {data ? `${data.length} places` : "Loading…"}
                        {checkIn && checkOut ? ` · ${checkIn} → ${checkOut}` : ""}
                        {guests ? ` · ${guests} guests` : ""}
                    </p>
                    <div className="mt-6">
                        <SearchBar compact />
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
                        ))}
                    </div>
                ) : data && data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                        {data.map((h) => (
                            <HotelCard key={h.id} hotel={h} fromCents={42000} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <p className="font-display text-2xl">Nothing matches yet.</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Try a broader destination or a different region.
                        </p>
                    </div>
                )}
            </section>

            <SiteFooter />
        </div>
    );
}