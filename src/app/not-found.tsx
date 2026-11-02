import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted">That route is not part of SolWatch.</p>
      <Link href="/" className="w-fit rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast">
        Look up a wallet
      </Link>
    </div>
  );
}
