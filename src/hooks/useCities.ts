// src/hooks/useCities.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface City {
    id: string;
    name: string;
    display_order: number;
}

export function useCities() {
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = async () => {
        const { data } = await supabase
            .from("cities")
            .select("*")
            .order("display_order", { ascending: true });
        setCities((data ?? []) as City[]);
        setLoading(false);
    };

    useEffect(() => {
        reload();
    }, []);

    return { cities, loading, reload };
}