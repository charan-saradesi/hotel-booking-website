import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";


export function SiteHeader({ variant = "solid" }: { variant?: "solid" | "over-image" }) {
  const { user } = useUser();

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
                </SignedIn>
      </header>
  );






  return (
      <>
        <SignedIn>
          <Link to="/bookings" className="hover:opacity-70">My bookings</Link>
        </SignedIn>
        <Link to="/search" className="hover:opacity-70">Explore hotels</Link>
      </>
  );}