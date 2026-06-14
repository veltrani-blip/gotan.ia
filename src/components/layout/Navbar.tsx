"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "#features", label: "Recursos" },
  { href: "#pricing", label: "Planos" },
  { href: "#sectors", label: "Por setor" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-container items-center justify-between px-6">
        <a href="#" aria-label="gotan.ia" className="flex items-center">
          <Image
            src="/branding/gotan-logo-horizontal.png"
            alt="gotan.ia"
            width={1370}
            height={500}
            priority
            className="h-8 w-auto"
          />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </a>
          <a href="/signup">
            <Button size="sm">Começar grátis</Button>
          </a>
        </div>
      </nav>
    </header>
  );
}
