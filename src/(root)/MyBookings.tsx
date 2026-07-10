import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

interface Booking {
    id: string;
    check_in: string;
    check_out: string;
    guests: number;
    status: string;
    hotels: { name: string; city: string; country: string } | null;
}

export default function MyBookings() {
    const { user } = useUser();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        supabase
            .from("bookings")
            .select("id, check_in, check_out, guests, status, hotels(name, city, country)")
            .eq("clerk_user_id", user.id)
            .then(({ data }) => {
                setBookings((data ?? []) as unknown as Booking[]);
                setLoading(false);
            });
    }, [user]);

    return (
        <div className="mx-auto max-w-4xl px-6 py-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Your trips
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">My bookings</h1>

            {loading ? (
                <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
            ) : bookings.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                    <Link
                        to="/search"
                        className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90"
                    >
                        Book now
                    </Link>
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-4">
                    {bookings.map((b) => (
                        <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                            <div className="font-display text-lg">{b.hotels?.name}</div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">
                                {b.hotels?.city}, {b.hotels?.country}
                            </div>
                            <div className="mt-2 text-sm">
                                {b.check_in} → {b.check_out} · {b.guests} guests · {b.status}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}