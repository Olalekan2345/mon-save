import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="font-mono text-5xl font-bold text-violet-400">404</p>
        <h1 className="mt-4 text-xl font-semibold">This page doesn&apos;t exist</h1>
        <p className="mt-2 text-sm text-ink-dim">The link may be outdated, or the address was mistyped.</p>
        <Link href="/" className="btn-primary mt-8">
          Back to MonSave
        </Link>
      </main>
    </>
  );
}
