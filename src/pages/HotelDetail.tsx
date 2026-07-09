import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";



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



    return (
        <div className="min-h-screen bg-background">
            <SiteHeader />

           

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

                                              ) : (
                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {availability.map((a) => (
                                    git
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
                           
                        <label className="mt-3 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Guests
              </span>
                           
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
                        
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}