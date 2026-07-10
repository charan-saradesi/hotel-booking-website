import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
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
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Loading…</p>
            </div>
        );
    }

    if (hotels.length === 0) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-16 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    Hotel dashboard
                </p>
                <h1 className="mt-2 font-display text-3xl">No property assigned yet</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Ask an admin to link your account to a hotel listing.
                </p>
            </div>
        );
    }

    const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Hotel dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">{selectedHotel?.name}</h1>

            {hotels.length > 1 && (
                <select
                    value={selectedHotelId ?? ""}
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                    className="mt-4 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                    {hotels.map((h) => (
                        <option key={h.id} value={h.id}>
                            {h.name}
                        </option>
                    ))}
                </select>
            )}

            <div className="mt-8 flex gap-2 border-b border-border">
                {(["availability", "bookings", "property"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={
                            "px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition " +
                            (tab === t
                                ? "border-b-2 border-accent text-foreground"
                                : "text-muted-foreground hover:text-foreground")
                        }
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                {selectedHotelId && tab === "availability" && (
                    <AvailabilityPanel hotelId={selectedHotelId} />
                )}
                {selectedHotelId && tab === "bookings" && <BookingsPanel hotelId={selectedHotelId} />}
                {selectedHotel && tab === "property" && <PropertyPanel hotel={selectedHotel} />}
            </div>
        </div>
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

    return (
        <div>
            <h2 className="font-display text-xl">Available dates</h2>
            <div className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-6">
                <label className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Date</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Rooms</span>
                    <input
                        type="number"
                        min={0}
                        value={rooms}
                        onChange={(e) => setRooms(Number(e.target.value))}
                        className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                </label>
                <label className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Price / night (₹)
          </span>
                    <input
                        type="number"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                </label>
                <button
                    onClick={saveRow}
                    className="rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90"
                >
                    {editingId ? "Update date" : "Save date"}
                </button>
                {editingId && (
                    <button
                        onClick={resetForm}
                        className="rounded-xl border border-border px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition hover:bg-secondary"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2">
                {rows.map((a) => (
                    <div
                        key={a.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3"
                    >
                        <div className="text-sm">
                            {a.date} · {a.rooms_available} rooms · ₹{(a.price_cents / 100).toLocaleString()}/night
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => startEdit(a)}
                                className="text-xs uppercase tracking-widest text-muted-foreground hover:opacity-70"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => removeRow(a.id)}
                                className="text-xs uppercase tracking-widest text-red-500 hover:opacity-70"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                {rows.length === 0 && <p className="text-sm text-muted-foreground">No dates added yet.</p>}
            </div>
        </div>
    );
}


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

    return (
        <div>
            <h2 className="font-display text-xl">Bookings</h2>
            <div className="mt-4 grid grid-cols-1 gap-3">
                {bookings.map((b) => (
                    <div
                        key={b.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
                    >
                        <div>
                            <div className="text-sm font-medium">{b.guest_name}</div>
                            <div className="text-sm text-muted-foreground">
                                {b.check_in} → {b.check_out} · {b.guests} guests
                            </div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">
                                {b.status}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {b.status !== "confirmed" && (
                                <button
                                    onClick={() => updateStatus(b.id, "confirmed")}
                                    className="rounded-lg border border-border px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-secondary"
                                >
                                    Confirm
                                </button>
                            )}
                            {b.status !== "cancelled" && (
                                <button
                                    onClick={() => updateStatus(b.id, "cancelled")}
                                    className="rounded-lg border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-red-500 hover:bg-red-50"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {bookings.length === 0 && (
                    <p className="text-sm text-muted-foreground">No bookings yet.</p>
                )}
            </div>
        </div>
    );
}

function PropertyPanel({ hotel }: { hotel: Hotel }) {
    const [form, setForm] = useState<Hotel>(hotel);
    const [saving, setSaving] = useState(false);
    const [guestsHosted, setGuestsHosted] = useState<number | null>(null);

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
                setGuestsHosted(total);
            });
    }, [hotel.id]);

    const save = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("hotels")
            .update({
                description: form.description,
                cover_image: form.cover_image,
                // star_rating removed — no longer owner-editable
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

            <div className="mt-4 flex gap-4">
                <div className="rounded-2xl border border-border bg-card px-5 py-4">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Guests hosted
                    </div>
                    <div className="mt-1 font-display text-2xl">{guestsHosted ?? "—"}</div>
                </div>
                <div className="rounded-2xl border border-border bg-card px-5 py-4">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        Rating
                    </div>
                    <div className="mt-1 font-display text-2xl">★ {hotel.star_rating.toFixed(1)}</div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
                <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Cover image URL
          </span>
                    <input
                        value={form.cover_image}
                        onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Description
          </span>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                </label>
            </div>

            <button
                onClick={save}
                disabled={saving}
                className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
            >
                {saving ? "Saving…" : "Save changes"}
            </button>
        </div>
    );
}