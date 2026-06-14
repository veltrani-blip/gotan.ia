import { Chip } from "@/components/ui/primitives";

const categories = [
  "SaaS",
  "CRM",
  "Dashboard",
  "E-commerce",
  "Landing Page",
  "API REST",
  "Agendamento",
  "Portal do Cliente",
  "Marketplace",
  "Painel Admin",
];

export function Marquee() {
  // Duplica a lista para que a animação de -50% gere loop contínuo sem corte.
  const items = [...categories, ...categories];

  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max gap-3 animate-marquee">
        {items.map((c, i) => (
          <Chip key={`${c}-${i}`} className="text-sm">
            {c}
          </Chip>
        ))}
      </div>
    </div>
  );
}
