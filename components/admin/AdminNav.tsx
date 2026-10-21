"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSignOut } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/pos", label: "POS" },
  { href: "/admin/brew", label: "Brew planner" },
];

export function AdminNav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/admin" ? path === "/admin" : path.startsWith(href) || (href === "/admin/pipeline" && path.startsWith("/admin/events"));

  return (
    <aside className="adm-side">
      <p className="adm-brand">Vibe Coded <span>Coffee OS</span></p>
      <nav className="adm-nav" aria-label="Admin">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}>{l.label}</Link>
        ))}
      </nav>
      <div className="adm-side__foot">
        <form action={adminSignOut}>
          <button>Sign out</button>
        </form>
      </div>
    </aside>
  );
}
