export default function BillingCancel() {
  return (
    <div className="billing-shell">
      <h1>Pagamento cancelado</h1>
      <p>Nenhuma cobrança foi feita. Você pode escolher um plano quando quiser.</p>
      <a href="/#pricing" className="icon-button" style={{ padding: "12px 28px", borderRadius: 13, textDecoration: "none", fontWeight: 700 }}>
        Ver planos
      </a>
    </div>
  );
}
