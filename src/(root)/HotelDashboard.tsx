import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
    Building2,
    CalendarDays,
    ClipboardList,
    Users,
    Star,
    Pencil,
    Trash2,
    Plus,
    X,
    Check,
    ImageIcon,
    Sparkles,
    ArrowUpRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import type { Hotel } from "@/lib/hotels";

interface AvailabilityRow {
    id: string;
    date: string;
    rooms_available: number;
    price_cents: number;
}

interface BookingRow {
    id: string;
    check_in: string;
    check_out: string;
    guests: number;
    status: string;
    clerk_user_id: string;
    guest_name?: string;
}

type Tab = "availability" | "bookings" | "property";

const TABS: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
    { key: "availability", label: "Availability", icon: CalendarDays },
    { key: "bookings", label: "Bookings", icon: ClipboardList },
    { key: "property", label: "Property", icon: Building2 },
];

function initials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

function daysUntil(dateStr: string) {
    const target = new Date(dateStr + "T00:00:00").getTime();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((target - now.getTime()) / 86400000);
}

/** Animates a number counting up from 0 whenever `value` changes. */
function useCountUp(value: number | null, duration = 900) {
    const [display, setDisplay] = useState(0);
    const frame = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (value === null) return;
        const start = performance.now();
        const from = 0;

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (progress < 1) frame.current = requestAnimationFrame(tick);
        };

        frame.current = requestAnimationFrame(tick);
        return () => {
            if (frame.current) cancelAnimationFrame(frame.current);
        };
    }, [value, duration]);

    return value === null ? null : display;
}

/** Shared keyframes for entrance + ambient motion, scoped once at the dashboard root. */
function DashboardStyles() {
    return (
        <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes ringPulse {
                0% { box-shadow: 0 0 0 0 hsl(var(--accent) / 0.35); }
                100% { box-shadow: 0 0 0 10px hsl(var(--accent) / 0); }
            }
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            .animate-fade-up {
                animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            .animate-ring-pulse {
                animation: ringPulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .text-gradient {
                background: linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent) / 0.55));
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
            }
        `}</style>
    );
}

export default function HotelDashboard() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { role, loading } = useProfile();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("availability");

    useEffect(() => {
        if (!loading && role !== "hotel_owner" && role !== "admin") {
            navigate("/", { replace: true });
        }
    }, [loading, role, navigate]);

    useEffect(() => {
        if (!user) return;
        supabase
            .from("hotels")
            .select("*")
            .eq("owner_clerk_id", user.id)
            .then(({ data }) => {
                const list = (data ?? []) as Hotel[];
                setHotels(list);
                if (list.length > 0) setSelectedHotelId(list[0].id);
            });
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader variant="solid" />
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Loading…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (hotels.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <SiteHeader variant="solid" />
                <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent animate-ring-pulse">
                        <Building2 size={24} strokeWidth={1.75} />
                    </div>
                    <p className="mt-5 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                        Hotel dashboard
                    </p>
                    <h1 className="mt-2 font-display text-3xl">No property assigned yet</h1>
                    <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                        Ask an admin to link your account to a hotel listing to start managing availability
                        and bookings.
                    </p>
                </div>
            </div>
        );
    }

    const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

    return (
        <div className="min-h-screen bg-background">
            <DashboardStyles />
            <SiteHeader variant="solid" />
            <div className="mx-auto max-w-5xl px-6 py-14">
                {/* Identity header */}
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-7 sm:px-8">
                    {/* decorative dot-grid pattern */}
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 text-accent/10"
                    >
                        <pattern id="dotgrid" width="18" height="18" patternUnits="userSpaceOnUse">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#dotgrid)" />
                    </svg>

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 font-display text-lg text-accent animate-ring-pulse">
                                {selectedHotel ? initials(selectedHotel.name) : ""}
                            </div>
                            <div>
                                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                                    <Sparkles size={12} className="text-accent" />
                                    Hotel dashboard
                                </p>
                                <h1 className="mt-1 font-display text-3xl leading-tight md:text-4xl">
                                    {selectedHotel?.name}
                                </h1>
                                {selectedHotel && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedHotel.city}, {selectedHotel.country}
                                    </p>
                                )}
                            </div>
                        </div>

                        {hotels.length > 1 && (
                            <select
                                value={selectedHotelId ?? ""}
                                onChange={(e) => setSelectedHotelId(e.target.value)}
                                className="h-10 rounded-full border border-border bg-background px-4 text-sm outline-none transition hover:border-accent/50 focus:border-accent"
                            >
                                {hotels.map((h) => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Tab nav */}
                <div className="mt-8 flex gap-1 rounded-full border border-border bg-card p-1 sm:inline-flex">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={
                                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition sm:flex-none " +
                                (tab === key
                                    ? "bg-accent text-accent-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground")
                            }
                        >
                            <Icon size={14} strokeWidth={2} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="mt-10">
                    {selectedHotelId && tab === "availability" && (
                        <AvailabilityPanel hotelId={selectedHotelId} />
                    )}
                    {selectedHotelId && tab === "bookings" && <BookingsPanel hotelId={selectedHotelId} />}
                    {selectedHotel && tab === "property" && <PropertyPanel hotel={selectedHotel} />}
                </div>
            </div>
        </div>
    );
}

function OccupancyRing({ percent }: { percent: number }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent / 100);

    return (
        <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
            <circle cx="38" cy="38" r={radius} fill="none" strokeWidth="7" className="stroke-secondary" />
            <circle
                cx="38"
                cy="38"
                r={radius}
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                className="stroke-accent transition-all duration-700 ease-out"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
            />
            <text
                x="38"
                y="38"
                textAnchor="middle"
                dominantBaseline="central"
                className="rotate-90 fill-foreground font-display text-[15px]"
                style={{ transformOrigin: "38px 38px" }}
            >
                {Math.round(percent)}%
            </text>
        </svg>
    );
}

function AvailabilityPanel({ hotelId }: { hotelId: string }) {
    const [rows, setRows] = useState<AvailabilityRow[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [date, setDate] = useState("");
    const [rooms, setRooms] = useState(1);
    const [price, setPrice] = useState(5000);

    const load = async () => {
        const { data } = await supabase
            .from("availability")
            .select("*")
            .eq("hotel_id", hotelId)
            .order("date", { ascending: true });
        setRows((data ?? []) as AvailabilityRow[]);
    };

    useEffect(() => {
        void load();
    }, [hotelId]);

    const resetForm = () => {
        setEditingId(null);
        setDate("");
        setRooms(1);
        setPrice(5000);
    };

    const startEdit = (row: AvailabilityRow) => {
        setEditingId(row.id);
        setDate(row.date);
        setRooms(row.rooms_available);
        setPrice(row.price_cents / 100);
    };

    const saveRow = async () => {
        if (!date) return;
        await supabase.from("availability").upsert(
            {
                hotel_id: hotelId,
                date,
                rooms_available: rooms,
                price_cents: price * 100,
            },
            { onConflict: "hotel_id,date" }
        );
        resetForm();
        load();
    };

    const removeRow = async (id: string) => {
        await supabase.from("availability").delete().eq("id", id);
        if (editingId === id) resetForm();
        load();
    };

    const maxRooms = Math.max(...rows.map((r) => r.rooms_available), 1);
    const avgPrice = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.price_cents, 0) / rows.length / 100)
        : 0;
    const occupancyPercent = rows.length
        ? Math.min(100, (rows.reduce((s, r) => s + r.rooms_available, 0) / (rows.length * maxRooms)) * 100)
        : 0;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-xl">Available dates</h2>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "date" : "dates"} open
                </span>
            </div>

            {rows.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-card px-6 py-5">
                    <OccupancyRing percent={occupancyPercent} />
                    <div className="flex flex-1 flex-wrap gap-8">
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                Avg. rooms open
                            </p>
                            <p className="mt-1 font-display text-2xl text-gradient">
                                {Math.round(rows.reduce((s, r) => s + r.rooms_available, 0) / rows.length)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                Avg. nightly rate
                            </p>
                            <p className="mt-1 font-display text-2xl text-gradient">
                                ₹{avgPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {editingId ? "Edit date" : "Add a date"}
                </p>
                <div className="mt-4 flex flex-wrap items-end gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                            Date
                        </span>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                            Rooms
                        </span>
                        <input
                            type="number"
                            min={0}
                            value={rooms}
                            onChange={(e) => setRooms(Number(e.target.value))}
                            className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                            Price / night (₹)
                        </span>
                        <input
                            type="number"
                            min={0}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                        />
                    </label>
                    <button
                        onClick={saveRow}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90 hover:shadow-md active:scale-[0.98]"
                    >
                        {editingId ? <Check size={14} /> : <Plus size={14} />}
                        {editingId ? "Update" : "Save date"}
                    </button>
                    {editingId && (
                        <button
                            onClick={resetForm}
                            className="flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition hover:bg-secondary"
                        >
                            <X size={14} />
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2">
                {rows.map((a, i) => (
                    <div
                        key={a.id}
                        style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                        className="group flex animate-fade-up items-center gap-5 rounded-xl border border-border bg-card px-5 py-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                    >
                        <div className="w-24 shrink-0">
                            <div className="font-display text-lg leading-none">
                                {new Date(a.date + "T00:00:00").toLocaleDateString(undefined, {
                                    day: "2-digit",
                                    month: "short",
                                })}
                            </div>
                            <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                                {new Date(a.date + "T00:00:00").toLocaleDateString(undefined, {
                                    weekday: "short",
                                })}
                            </div>
                        </div>

                        <div className="h-8 w-px bg-border" />

                        <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{a.rooms_available} rooms available</span>
                                <span>₹{(a.price_cents / 100).toLocaleString()}/night</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full bg-accent transition-all duration-500"
                                    style={{
                                        width: `${Math.max(6, (a.rooms_available / maxRooms) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                                onClick={() => startEdit(a)}
                                aria-label="Edit date"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => removeRow(a.id)}
                                aria-label="Remove date"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rose-50 hover:text-rose-600"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {rows.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No dates added yet — open your calendar above.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const STATUS_STYLES: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
    pending: "bg-amber-50 text-amber-700",
};

const STATUS_BORDER: Record<string, string> = {
    confirmed: "before:bg-emerald-400",
    cancelled: "before:bg-rose-400",
    pending: "before:bg-amber-400",
};

function BookingsPanel({ hotelId }: { hotelId: string }) {
    const [bookings, setBookings] = useState<BookingRow[]>([]);

    const load = async () => {
        const { data } = await supabase
            .from("bookings")
            .select("*")
            .eq("hotel_id", hotelId)
            .order("created_at", { ascending: false });

        const rows = (data ?? []) as BookingRow[];
        const clerkIds = [...new Set(rows.map((b) => b.clerk_user_id))];

        if (clerkIds.length > 0) {
            const { data: profiles } = await supabase
                .from("profiles")
                .select("clerk_user_id, full_name, email")
                .in("clerk_user_id", clerkIds);

            const profileMap = new Map((profiles ?? []).map((p) => [p.clerk_user_id, p]));
            rows.forEach((b) => {
                const p = profileMap.get(b.clerk_user_id);
                b.guest_name = p?.full_name || p?.email || "Guest";
            });
        }

        setBookings(rows);
    };

    useEffect(() => {
        void load();
    }, [hotelId]);

    const updateStatus = async (id: string, status: string) => {
        await supabase.from("bookings").update({ status }).eq("id", id);
        load();
    };

    const nextArrival = bookings
        .filter((b) => b.status === "confirmed" && daysUntil(b.check_in) >= 0)
        .sort((a, b) => daysUntil(a.check_in) - daysUntil(b.check_in))[0];

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="font-display text-xl">Bookings</h2>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {bookings.length} total
                </span>
            </div>

            {nextArrival && (
                <div className="mt-4 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-accent/30 bg-accent/5 px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <ArrowUpRight size={18} />
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-widest text-accent">Next arrival</p>
                            <p className="mt-0.5 font-display text-lg">{nextArrival.guest_name}</p>
                            <p className="text-xs text-muted-foreground">
                                Checking in {nextArrival.check_in} · {nextArrival.guests} guests
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-display text-3xl text-gradient">
                            {daysUntil(nextArrival.check_in)}
                        </div>
                        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                            {daysUntil(nextArrival.check_in) === 1 ? "day away" : "days away"}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3">
                {bookings.map((b, i) => (
                    <div
                        key={b.id}
                        style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                        className={
                            "relative flex animate-fade-up flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 pl-6 transition hover:-translate-y-0.5 hover:shadow-md before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 sm:flex-row sm:items-center sm:justify-between " +
                            (STATUS_BORDER[b.status] ?? "before:bg-border")
                        }
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                                {initials(b.guest_name || "Guest")}
                            </div>
                            <div>
                                <div className="text-sm font-medium">{b.guest_name}</div>
                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarDays size={12} />
                                    {b.check_in} → {b.check_out}
                                    <span className="text-border">·</span>
                                    <Users size={12} />
                                    {b.guests}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className={
                                    "rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-widest " +
                                    (STATUS_STYLES[b.status] ?? "bg-secondary text-muted-foreground")
                                }
                            >
                                {b.status}
                            </span>
                            <div className="flex gap-2">
                                {b.status !== "confirmed" && (
                                    <button
                                        onClick={() => updateStatus(b.id, "confirmed")}
                                        className="rounded-full border border-border px-3 py-1.5 text-xs uppercase tracking-widest transition hover:bg-secondary"
                                    >
                                        Confirm
                                    </button>
                                )}
                                {b.status !== "cancelled" && (
                                    <button
                                        onClick={() => updateStatus(b.id, "cancelled")}
                                        className="rounded-full border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-rose-600 transition hover:bg-rose-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {bookings.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                        <p className="text-sm text-muted-foreground">No bookings yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PropertyPanel({ hotel }: { hotel: Hotel }) {
    const [form, setForm] = useState<Hotel>(hotel);
    const [saving, setSaving] = useState(false);
    const [guestsHostedRaw, setGuestsHostedRaw] = useState<number | null>(null);
    const guestsHosted = useCountUp(guestsHostedRaw);

    useEffect(() => {
        setForm(hotel);
    }, [hotel]);

    useEffect(() => {
        supabase
            .from("bookings")
            .select("guests")
            .eq("hotel_id", hotel.id)
            .eq("status", "confirmed")
            .then(({ data }) => {
                const total = (data ?? []).reduce((sum, b) => sum + (b.guests ?? 0), 0);
                setGuestsHostedRaw(total);
            });
    }, [hotel.id]);

    const save = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("hotels")
            .update({
                description: form.description,
                cover_image: form.cover_image,
            })
            .eq("id", form.id);
        setSaving(false);
        if (error) alert(`Failed to save: ${error.message}`);
    };

    return (
        <div>
            <h2 className="font-display text-xl">Property info</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Name, city, and country are managed by admin.
            </p>

            {/* Cover + stats */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1.1fr_1fr]">
                <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
                    {form.cover_image ? (
                        <img
                            src={form.cover_image}
                            alt={hotel.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon size={28} strokeWidth={1.5} />
                        </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-widest">
                        {hotel.city}, {hotel.country}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                            <Users size={13} />
                            Guests hosted
                        </div>
                        <div className="mt-2 font-display text-3xl text-gradient">{guestsHosted ?? "—"}</div>
                        <div className="mt-1 text-xs text-muted-foreground">across confirmed stays</div>
                    </div>
                    <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                            <Star size={13} className="fill-accent text-accent" />
                            Rating
                        </div>
                        <div className="mt-2 font-display text-3xl text-gradient">
                            {hotel.star_rating.toFixed(1)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">set by platform reviews</div>
                    </div>
                </div>
            </div>

            {/* Editable fields */}
            <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-6">
                <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Cover image URL
                    </span>
                    <input
                        value={form.cover_image}
                        onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Description
                    </span>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent"
                    />
                </label>
            </div>

            <button
                onClick={save}
                disabled={saving}
                className="mt-6 flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
                {saving ? "Saving…" : "Save changes"}
            </button>
        </div>
    );
}