import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useCities } from "@/hooks/useCities";
import { supabase } from "@/lib/supabase";
import type { Hotel } from "@/lib/hotels";

const HOTEL_FIELDS: [keyof Hotel, string][] = [
    ["name", "Name"],
    ["slug", "Slug"],
    ["country", "Country"],
    ["region", "Region"],
    ["cover_image", "Cover image URL"],
    ["owner_clerk_id", "Owner Clerk User ID"],
];

type Tab = "hotels" | "cities" | "users";

interface Profile {
    id: string;
    clerk_user_id: string;
    email: string | null;
    full_name: string | null;
    role: string;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { role, loading } = useProfile();
    const [tab, setTab] = useState<Tab>("hotels");

    useEffect(() => {
        if (!loading && role !== "admin") {
            navigate("/", { replace: true });
        }
    }, [loading, role, navigate]);

    if (loading || role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Loading…</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Admin
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Dashboard</h1>

            <div className="mt-8 flex gap-2 border-b border-border">
                {(["hotels", "cities", "users"] as Tab[]).map((t) => (
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
                {tab === "hotels" && <HotelsPanel />}
                {tab === "cities" && <CitiesPanel />}
                {tab === "users" && <UsersPanel />}
            </div>
        </div>
    );
}

function HotelsPanel() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [editing, setEditing] = useState<Partial<Hotel> | null>(null);
    const { cities } = useCities();

    const loadHotels = async () => {
        const { data } = await supabase
            .from("hotels")
            .select("*")
            .order("created_at", { ascending: false });
        setHotels((data ?? []) as Hotel[]);
    };

    useEffect(() => {
        void loadHotels();
    }, []);

    const saveHotel = async () => {
        if (!editing) return;
        const payload = {
            slug: editing.slug,
            name: editing.name,
            city: editing.city,
            country: editing.country,
            region: editing.region,
            description: editing.description,
            star_rating: editing.star_rating,
            amenities: editing.amenities,
            cover_image: editing.cover_image,
            owner_clerk_id: editing.owner_clerk_id,
        };

        const { error } = editing.id
            ? await supabase.from("hotels").update(payload).eq("id", editing.id)
            : await supabase.from("hotels").insert(payload);

        if (error) {
            alert(`Failed to save hotel: ${error.message}`);
            console.error(error);
            return;
        }

        setEditing(null);
        loadHotels();
    };
    const deleteHotel = async (id: string) => {
        await supabase.from("hotels").delete().eq("id", id);
        loadHotels();
    };

    return (
        <div>
            <div className="flex items-end justify-between gap-6">
                <h2 className="font-display text-xl">Hotels</h2>
                <button
                    onClick={() =>
                        setEditing({
                            slug: "",
                            name: "",
                            city: cities[0]?.name ?? "",
                            country: "India",
                            region: "",
                            description: "",
                            star_rating: 4.5,
                            amenities: [],
                            cover_image: "",
                            owner_clerk_id: "",
                        })
                    }
                    className="rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90"
                >
                    + Add hotel
                </button>
            </div>

            {editing && (
                <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                    <h3 className="font-display text-lg">{editing.id ? "Edit hotel" : "New hotel"}</h3>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                City
              </span>
                            <select
                                value={editing.city ?? ""}
                                onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                            >
                                <option value="">Select a city</option>
                                {cities.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {HOTEL_FIELDS.map(([key, label]) => (
                            <label key={key} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
                                <input
                                    value={(editing[key] as string) ?? ""}
                                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                                />
                            </label>
                        ))}
                        <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Description
              </span>
                            <textarea
                                value={editing.description ?? ""}
                                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                                rows={3}
                            />
                        </label>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={saveHotel}
                            className="rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setEditing(null)}
                            className="rounded-xl border border-border px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition hover:bg-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4">
                {hotels.map((h) => (
                    <div
                        key={h.id}
                        className="flex items-center justify-between gap-6 rounded-2xl border border-border bg-card p-5"
                    >
                        <div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">
                                {h.city}, {h.country}
                            </div>
                            <div className="font-display text-lg">{h.name}</div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditing(h)}
                                className="rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-widest transition hover:bg-secondary"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => deleteHotel(h.id)}
                                className="rounded-lg border border-border px-4 py-2 text-xs uppercase tracking-widest text-red-500 transition hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {hotels.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hotels yet.</p>
                )}
            </div>
        </div>
    );
}

function CitiesPanel() {
    const { cities, reload } = useCities();
    const [newCity, setNewCity] = useState("");

    const addCity = async () => {
        if (!newCity.trim()) return;
        await supabase.from("cities").insert({
            name: newCity.trim(),
            display_order: cities.length + 1,
        });
        setNewCity("");
        reload();
    };

    const removeCity = async (id: string) => {
        await supabase.from("cities").delete().eq("id", id);
        reload();
    };

    return (
        <div>
            <h2 className="font-display text-xl">Cities</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                These populate the search dropdown across the site.
            </p>

            <div className="mt-6 flex gap-3">
                <input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Rishikesh"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                />
                <button
                    onClick={addCity}
                    className="rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90"
                >
                    Add city
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cities.map((c) => (
                    <div
                        key={c.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                    >
                        <span className="text-sm">{c.name}</span>
                        <button
                            onClick={() => removeCity(c.id)}
                            className="text-xs uppercase tracking-widest text-red-500 hover:opacity-70"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                {cities.length === 0 && (
                    <p className="text-sm text-muted-foreground">No cities added yet.</p>
                )}
            </div>
        </div>
    );
}

function UsersPanel() {
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const loadProfiles = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("id, clerk_user_id, email, full_name, role")
            .order("email", { ascending: true });
        setProfiles((data ?? []) as Profile[]);
    };

    useEffect(() => {
        void loadProfiles();
    }, []);
    const updateRole = async (id: string, role: string) => {
        await supabase.from("profiles").update({ role }).eq("id", id);
        loadProfiles();
    };

    return (
        <div>
            <h2 className="font-display text-xl">Users</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Assign roles. Hotel owners see only hotels they're linked to via the Hotels tab.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-2">
                {profiles.map((p) => (
                    <div
                        key={p.id}
                        className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div>
                            <div className="text-sm font-medium">{p.full_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{p.email}</div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {p.clerk_user_id}
                            </div>
                        </div>
                        <select
                            value={p.role}
                            onChange={(e) => updateRole(p.id, e.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-xs uppercase tracking-widest outline-none"
                        >
                            <option value="user">User</option>
                            <option value="hotel_owner">Hotel owner</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                ))}
                {profiles.length === 0 && (
                    <p className="text-sm text-muted-foreground">No users yet.</p>
                )}
            </div>
        </div>
    );
}