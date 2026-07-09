import { Link } from "react-router-dom";
import type { Hotel } from "@/lib/hotels";
import { resolveImage, formatUSD } from "@/lib/hotels";

export function HotelCard({ hotel, fromCents }: { hotel: Hotel; fromCents?: number }) {
    return (
        <Link to={`/hotels/${hotel.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-muted">
                <img
                    src={resolveImage(hotel.cover_image)}
                    alt={hotel.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-foreground">
                    {hotel.region ?? hotel.country}
                </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        {hotel.city}, {hotel.country}
                    </div>
                    <h3 className="mt-1 font-display text-xl font-medium leading-tight">{hotel.name}</h3>
                </div>
                <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">from</div>
                    <div className="font-display text-lg">
                        {fromCents ? formatUSD(fromCents) : "—"}
                        <span className="text-xs font-sans text-muted-foreground"> /night</span>
                    </div>
                </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{hotel.description}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>★ {hotel.star_rating.toFixed(1)}</span>
                <span>·</span>
                <span>{hotel.amenities.slice(0, 2).join(" · ")}</span>
            </div>
        </Link>
    );
}