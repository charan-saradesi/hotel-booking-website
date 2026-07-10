import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchBar } from "@/components/search-bar";
import { HotelCard } from "@/components/hotel-card";
import { hotelsListQuery } from "@/lib/hotels";
import { Link } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

const places = [
    { name: "Goa", copy: "Sun-bleached shacks, Portuguese lanes, and long low tides." },
    { name: "Jaipur", copy: "Pink sandstone forts and lantern-lit havelis." },
    { name: "Kerala", copy: "Backwater houseboats gliding through rain-fed hills." },
    { name: "Udaipur", copy: "Lake palaces and marble courtyards lit at dusk." },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader variant="over-image" />

            {/* Hero */}
            <section className="relative">
                <div className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
                    <img
                        src={heroImg}
                        alt="Coastal boutique hotel at golden hour"
                        width={1920}
                        height={1200}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />
                    <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-40 pt-40 text-ivory">
                        <div className="max-w-3xl">
                            <p className="text-xs font-medium uppercase tracking-[0.3em] opacity-90">
                                Trusted by 50,000+ travelers
                            </p>
                            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] md:text-7xl">
                                Somewhere you have never
                                <br />
                                <em className="italic text-ivory/95">quite been.</em>
                            </h1>
                            <p className="mt-6 max-w-xl text-base opacity-90 md:text-lg">
                                A quiet marketplace of hand-picked hotels, homestays, and heritage havelis — the
                                kind of places you tell one friend about.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating search */}
                <div className="mx-auto -mt-24 max-w-6xl px-6 md:-mt-20">
                    <SearchBar />
                </div>
            </section>

            {/* Places strip */}
            <section className="mx-auto mt-24 max-w-7xl px-6">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                            Where to
                        </p>
                        <h2 className="mt-2 font-display text-3xl md:text-4xl">Browse by places</h2>
                    </div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-4">
                    {places.map((p) => (
                        <Link
                            key={p.name}
                            to={`/search?region=${encodeURIComponent(p.name)}`}
                            className="group bg-card p-8 transition hover:bg-secondary"
                        >
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">Place</div>
                            <div className="mt-2 font-display text-2xl">{p.name}</div>
                            <p className="mt-3 text-sm text-muted-foreground">{p.copy}</p>
                            <div className="mt-6 text-xs uppercase tracking-widest text-accent">
                                See stays →
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured */}
            <section className="mx-auto mt-24 max-w-7xl px-6">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                            This month
                        </p>
                        <h2 className="mt-2 font-display text-3xl md:text-4xl">Rooms worth the flight</h2>
                    </div>
                    <Link
                        to="/search"
                        className="hidden text-xs uppercase tracking-widest text-accent hover:opacity-70 md:inline"
                    >
                        All stays →
                    </Link>
                </div>
                <ErrorBoundary
                    fallback={
                        <p className="mt-10 text-sm text-muted-foreground">
                            Couldn't load hotels right now — check back soon.
                        </p>
                    }
                >
                    <Suspense fallback={<CardsFallback />}>
                        <FeaturedHotels />
                    </Suspense>
                </ErrorBoundary>
            </section>

            {/* Editorial band */}
            <section className="mx-auto mt-28 max-w-4xl px-6 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    The Lumihaven brief
                </p>
                <p className="mt-6 font-display text-2xl leading-snug md:text-3xl">
                    &ldquo;We only list the places we&rsquo;d send our sister to. No filler, no fake reviews,
                    no seventeen&#8209;photo carousels of the same bathroom.&rdquo;
                </p>
                <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                    — The editors
                </p>
            </section>

            <SiteFooter />
        </div>
    );
}

function CardsFallback() {
    return (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] rounded-2xl bg-muted" />
                    <div className="mt-4 h-4 w-1/3 rounded bg-muted" />
                    <div className="mt-2 h-6 w-2/3 rounded bg-muted" />
                </div>
            ))}
        </div>
    );
}

function FeaturedHotels() {
    const { data } = useSuspenseQuery(hotelsListQuery());
    return (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 6).map((h) => (
                <HotelCard key={h.id} hotel={h} fromCents={42000} />
            ))}
        </div>
    );
}