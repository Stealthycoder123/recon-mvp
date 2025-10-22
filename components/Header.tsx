import Link from "next/link";
import { ModeToggle } from "./ModeToggle";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-semibold tracking-tight"
        >
          Recon
        </Link>
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
