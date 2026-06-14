import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Produto",
    links: ["Recursos", "Planos", "Templates", "Novidades"],
  },
  {
    title: "Recursos",
    links: ["Documentação", "Guias", "Comunidade", "Status"],
  },
  {
    title: "Por Setor",
    links: ["Saúde", "Varejo", "Serviços", "Educação"],
  },
  {
    title: "Empresa",
    links: ["Sobre", "Contato", "Carreiras", "Imprensa"],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-container px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">
              Da ideia ao app, conversando com a IA.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-fg">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">© {year} gotan.ia. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted transition-colors hover:text-fg">
              Privacidade
            </a>
            <a href="#" className="text-xs text-muted transition-colors hover:text-fg">
              Termos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
