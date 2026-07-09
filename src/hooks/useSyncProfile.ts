// src/hooks/useSyncProfile.ts
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

export function useSyncProfile() {
    const { user, isSignedIn } = useUser();

    useEffect(() => {
        if (!isSignedIn || !user) return;

        const syncProfile = async () => {
            const { error } = await supabase.from("profiles").upsert(
                {
                    clerk_user_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress ?? null,
                    full_name: user.fullName ?? null,
                    avatar_url: user.imageUrl ?? null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

            if (error) {
                console.error("Failed to sync profile:", error.message);
            }
        };

        syncProfile();
    }, [isSignedIn, user]);
}