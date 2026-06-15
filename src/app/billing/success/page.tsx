export default function BillingSuccess() {
  return (
    <div className="billing-shell">
      <h1>
        Pagamento <span className="gradient-text">confirmado</span>
      </h1>
      <p>Seu plano foi ativado. Os créditos já estão disponíveis na sua conta.</p>
      <a href="/builder" className="gradient-button" style={{ padding: "12px 28px", borderRadius: 13, textDecoration: "none", fontWeight: 800 }}>
        Ir para o Builder
      </a>
    </div>
  );
}
