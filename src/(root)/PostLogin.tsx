import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-react";

export default function PostLogin() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { role, loading, isSignedIn, isLoaded } = useProfile();

    useEffect(() => {
        if (!isLoaded || loading) return;

        if (!isSignedIn) {
            navigate("/", { replace: true });
            return;
        }

        const decide = async () => {
            if (role === "admin") {
                navigate("/admin", { replace: true });
                return;
            }

            if (role === "hotel_owner") {
                navigate("/hotel-dashboard", { replace: true });
                return;
            }

            const { count } = await supabase
                .from("bookings")
                .select("*", { count: "exact", head: true })
                .eq("clerk_user_id", user!.id);

            if (count && count > 0) {
                navigate("/bookings", { replace: true });
            } else {
                navigate("/search", { replace: true });
            }
        };

        decide();
    }, [isLoaded, loading, isSignedIn, role, user, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Taking you to your stays…
            </p>
        </div>
    );
}