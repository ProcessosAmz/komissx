import { Logo } from "@/components/common/Logo";

export function AsideBrand() {
  return (
    <section className="login-brand" aria-label="Informações institucionais">
      <div className="login-logo">
        <Logo />
      </div>

      <div className="logo-divider" aria-hidden="true" />

      <div className="brand-copy">
        <h1>KomissX</h1>
        <p>
          Plataforma corporativa para comissões e automação de regras de
          negócio complexas.
        </p>
      </div>

      <div className="brand-status">
        <span aria-hidden="true" />
        Sistema online
      </div>
    </section>
  );
}