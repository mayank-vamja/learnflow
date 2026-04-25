"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function AppShell({ title, children }: Props) {
  const pathname = usePathname();

  const nav = [
    { href: "/learner", label: "Learner" },
    { href: "/admin", label: "Admin" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <section className="material-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">AI Learning OS</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">LearnFlow AI</h1>
            {title ? <p className="mt-2 text-sm text-white/80 sm:text-base">{title}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nav.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={active ? "pill-btn" : "pill-btn-alt"}>
                  {item.label}
                </Link>
              );
            })}
            <Link href="/" className="pill-btn-alt">
              Home
            </Link>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}

