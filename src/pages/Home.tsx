import heroImg from "@/assets/hero.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
            </section>

            {/* Places strip */}
            {/* Featured */}

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