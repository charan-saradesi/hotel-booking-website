import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";

export function SiteHeader({ variant = "solid" }: { variant?: "solid" | "over-image" }) {
  const { user } = useUser();
  const { role } = useProfile();
  const over = variant === "over-image";

  return (
      <header
          className={
            over
                ? "absolute top-0 left-0 right-0 z-30 text-ivory"
                : "sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur"
          }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-medium tracking-tight">Lumihaven</span>
            <span
                className={
                  over
                      ? "text-xs uppercase tracking-widest opacity-80"
                      : "text-xs uppercase tracking-widest text-muted-foreground"
                }
            >
            &nbsp;Est. Everywhere
          </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <NavLinks role={role} />
          </nav>

          <div className="flex items-center gap-4 text-sm">
            <SignedIn>
              {user?.primaryEmailAddress && (
                  <span className="hidden text-xs opacity-60 lg:inline">
                {user.primaryEmailAddress.emailAddress}
              </span>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/redirect">
                <button className="rounded-full border border-current px-4 py-1.5 text-xs uppercase tracking-widest opacity-80 hover:opacity-100">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <SignedIn>
          <nav className="flex items-center gap-6 overflow-x-auto border-t border-border/50 px-6 py-3 text-sm md:hidden">
            <NavLinks role={role} />
          </nav>
        </SignedIn>
      </header>
  );
}

function NavLinks({ role }: { role: string | null }) {
  if (role === "admin") {
    return (
        <>
          <Link to="/admin" className="hover:opacity-70">Dashboard</Link>
          <Link to="/search" className="hover:opacity-70">Explore hotels</Link>
        </>
    );
  }

  if (role === "hotel_owner") {
    return (
        <>
          <Link to="/hotel-dashboard" className="hover:opacity-70">Dashboard</Link>
          <Link to="/search" className="hover:opacity-70">Explore hotels</Link>
        </>
    );
  }

  return (
      <>
        <SignedIn>
          <Link to="/bookings" className="hover:opacity-70">My bookings</Link>
        </SignedIn>
        <Link to="/search" className="hover:opacity-70">Explore hotels</Link>
      </>
  );
}