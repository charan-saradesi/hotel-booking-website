import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCities } from "@/hooks/useCities";

function tomorrow(offset = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { cities, loading: citiesLoading } = useCities();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(tomorrow(7));
  const [checkOut, setCheckOut] = useState(tomorrow(10));
  const [guests, setGuests] = useState(2);

  return (
      <form
          onSubmit={(e) => {
            e.preventDefault();
            const params = new URLSearchParams({
              destination,
              checkIn,
              checkOut,
              guests: String(guests),
            });
            navigate(`/search?${params.toString()}`);
          }}
          className={
              "grid w-full gap-0 bg-card text-card-foreground shadow-xl ring-1 ring-black/5 " +
              (compact
                  ? "grid-cols-1 rounded-full sm:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]"
                  : "grid-cols-1 rounded-2xl md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]")
          }
      >
        <label className="flex flex-col gap-1 border-b border-border px-6 py-4 md:border-b-0 md:border-r">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Where</span>
          <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={citiesLoading}
              className="bg-transparent text-sm font-medium outline-none"
          >
            <option value="">{citiesLoading ? "Loading…" : "Anywhere"}</option>
            {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 border-b border-border px-6 py-4 md:border-b-0 md:border-r">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Check in</span>
          <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 border-b border-border px-6 py-4 md:border-b-0 md:border-r">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Check out</span>
          <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 border-b border-border px-6 py-4 md:border-b-0 md:border-r">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Guests</span>
          <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="bg-transparent text-sm font-medium outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
            ))}
          </select>
        </label>
        <div className="flex items-center justify-center p-3">
          <button
              type="submit"
              className={
                  "h-full w-full whitespace-nowrap bg-accent px-6 py-3 text-sm font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90 " +
                  (compact ? "rounded-full" : "rounded-xl")
              }
          >
            Search stays
          </button>
        </div>
      </form>
  );
}