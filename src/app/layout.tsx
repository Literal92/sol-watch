import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { clusterLabel, getCluster } from "@/lib/cluster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SolWatch",
    template: "%s · SolWatch",
  },
  description:
    "Read-only Solana portfolio tracker. Look up any public address for its SOL balance, tokens, and recent activity.",
  applicationName: "SolWatch",
  openGraph: {
    title: "SolWatch",
    description: "A read-only Solana wallet tracker. No keys, no signing, no sending.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SolWatch",
    description: "A read-only Solana wallet tracker.",
  },
};

const themeBoot = `(function(){try{if(localStorage.getItem("solwatch-theme")==="light"){document.documentElement.classList.remove("dark");}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const cluster = clusterLabel(getCluster());
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ?? "";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <AppProviders endpoint={endpoint}>
          <SiteHeader clusterLabel={cluster} walletEnabled={Boolean(endpoint)} />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border px-4 py-6 text-sm text-muted sm:px-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>Read-only. SolWatch never asks for a seed phrase, private key, or signature.</p>
              <p>{cluster}</p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
