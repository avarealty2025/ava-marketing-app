import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A.V.A. Command Center",
  description: "AI Marketing Engine for A.V.A. Realty",
};

const nav = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/approvals", label: "Approvals", icon: "✅" },
  { href: "/campaigns", label: "Campaigns", icon: "📊" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/performance", label: "Performance", icon: "📈" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <aside className="w-56 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 fixed inset-y-0 left-0 z-30">
          <div className="p-5 border-b border-zinc-800">
            <h1 className="text-sm font-bold tracking-wide text-white">
              A.V.A. REALTY
            </h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              AI Marketing Command Center
            </p>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-zinc-500">System Active</span>
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">
              Autonomy: LOW · Phase 0
            </p>
          </div>
        </aside>
        <main className="flex-1 ml-56 overflow-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
