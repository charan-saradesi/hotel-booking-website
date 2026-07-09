import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/lib/supabase";
import { resolveImage, formatUSD } from "@/lib/hotels";
import type { Hotel } from "@/lib/hotels";

interface AvailabilityRow {
    id: string;
    date: string;
    rooms_available: number;
    price_cents: number;
}

export default function HotelDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useUser();

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
    const [loading, setLoading] = useState(true);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [booking, setBooking] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const load = async () => {
            setLoading(true);
            const { data: hotelData } = await supabase
                .from("hotels")
                .select("*")
                .eq("slug", slug)
                .single();

            if (!hotelData) {
                setLoading(false);
                return;
            }

            setHotel(hotelData as Hotel);

            const { data: availData } = await supabase
                .from("availability")
                .select("*")
                .eq("hotel_id", hotelData.id)
                .gte("date", new Date().toISOString().slice(0, 10))
                .gt("rooms_available", 0)
                .order("date", { ascending: true });

            setAvailability((availData ?? []) as AvailabilityRow[]);
            setLoading(false);
        };

        load();
    }, [slug]);

    const handleBook = async () => {
        if (!hotel || !user || !checkIn || !checkOut) return;
        setBooking(true);
        setMessage(null);

        const { error } = await supabase.from("bookings").insert({
            clerk_user_id: user.id,
            hotel_id: hotel.id,
            check_in: checkIn,
            check_out: checkOut,
            guests,
            status: "pending",
        });

        setBooking(false);

        if (error) {
            setMessage("Something went wrong — please try again.");
        } else {
            setMessage("Booking request sent! Redirecting to your bookings…");
            setTimeout(() => navigate("/bookings"), 1200);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader />
                <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Loading…</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader />
                <div className="mx-auto max-w-5xl px-6 py-24 text-center">
                    <p className="font-display text-2xl">Hotel not found</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />

            <section className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
                <img
                    src={resolveImage(hotel.cover_image)}
                    alt={hotel.name}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-10 text-ivory">
                    <p className="text-xs uppercase tracking-widest opacity-90">
                        {hotel.city}, {hotel.country}
                    </p>
                    <h1 className="mt-2 font-display text-4xl md:text-5xl">{hotel.name}</h1>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr]">
                    <div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{hotel.description}</p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {hotel.amenities.map((a) => (
                                <span
                                    key={a}
                                    className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground"
                                >
                  {a}
                </span>
                            ))}
                        </div>

                        <h2 className="mt-10 font-display text-xl">Available dates</h2>
                        {availability.length === 0 ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                                No available dates listed right now — check back soon.
                            </p>
                        ) : (
                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {availability.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => {
                                            setCheckIn(a.date);
                                            const out = new Date(a.date);
                                            out.setDate(out.getDate() + 1);
                                            setCheckOut(out.toISOString().slice(0, 10));
                                        }}
                                        className={
                                            "rounded-xl border px-4 py-3 text-left text-sm transition " +
                                            (checkIn === a.date
                                                ? "border-accent bg-accent-bg"
                                                : "border-border hover:bg-secondary")
                                        }
                                    >
                                        <div className="font-medium">{a.date}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {a.rooms_available} rooms left · {formatUSD(a.price_cents)}/night
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-fit rounded-2xl border border-border bg-card p-6">
                        <h2 className="font-display text-xl">Book your stay</h2>

                        <label className="mt-4 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Check in
              </span>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            />
                        </label>
                        <label className="mt-3 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Check out
              </span>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            />
                        </label>
                        <label className="mt-3 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Guests
              </span>
                            <select
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value))}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            >
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <option key={n} value={n}>
                                        {n} {n === 1 ? "guest" : "guests"}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

                        <SignedIn>
                            <button
                                onClick={handleBook}
                                disabled={booking || !checkIn || !checkOut}
                                className="mt-6 w-full rounded-xl bg-accent px-5 py-3 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
                            >
                                {booking ? "Booking…" : "Book now"}
                            </button>
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal" forceRedirectUrl={`/hotels/${slug}`}>
                                <button className="mt-6 w-full rounded-xl bg-accent px-5 py-3 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90">
                                    Sign in to book
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}