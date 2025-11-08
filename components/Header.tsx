import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { getUser } from "@/auth/server";
import { Button } from "./ui/button";
import LogOutButton from "./LogOutButton";

async function Header() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          Recon
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <LogOutButton />
          ) : (
            <>
              <Button asChild>
                <Link href="/sign-up" className="hidden sm:block">
                  Sign Up
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
