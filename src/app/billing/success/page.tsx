import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BillingSuccess() {
  return (
    <main className="bg-glow flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        Pagamento <span className="text-gradient">confirmado</span>
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Seu plano foi ativado. Os créditos já estão disponíveis na sua conta.
      </p>
      <Link href="/app" className="mt-8">
        <Button size="lg">Ir para o app</Button>
      </Link>
    </main>
  );
}
