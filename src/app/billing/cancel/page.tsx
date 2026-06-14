import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BillingCancel() {
  return (
    <main className="bg-glow flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Pagamento cancelado</h1>
      <p className="mt-3 max-w-md text-muted">
        Nenhuma cobrança foi feita. Você pode escolher um plano quando quiser.
      </p>
      <Link href="/#pricing" className="mt-8">
        <Button variant="outline" size="lg">
          Ver planos
        </Button>
      </Link>
    </main>
  );
}
