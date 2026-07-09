import { useCities } from "@/hooks/useCities";

export function CitySelect({
                               value,
                               onChange,
                               label = "Where",
                               className = "",
                           }: {
    value: string;
    onChange: (city: string) => void;
    label?: string;
    className?: string;
}) {
    const { cities, loading } = useCities();

    return (
        <label className={className}>
      <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading}
                className="bg-transparent text-sm font-medium outline-none"
            >
                <option value="">{loading ? "Loading…" : "Select a city"}</option>
                {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                        {c.name}
                    </option>
                ))}
            </select>
        </label>
    );
}