import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

export function useProfile() {
    const { user, isSignedIn, isLoaded } = useUser();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn || !user) {
            setLoading(false);
            return;
        }

        const syncAndFetch = async () => {
            // upsert without touching role, so admins stay admins
            await supabase.from("profiles").upsert(
                {
                    clerk_user_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress ?? null,
                    full_name: user.fullName ?? null,
                    avatar_url: user.imageUrl ?? null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

            const { data } = await supabase
                .from("profiles")
                .select("role")
                .eq("clerk_user_id", user.id)
                .single();

            setRole(data?.role ?? "user");
            setLoading(false);
        };

        syncAndFetch();
    }, [isLoaded, isSignedIn, user]);

    return { role, loading, isSignedIn, isLoaded };
}