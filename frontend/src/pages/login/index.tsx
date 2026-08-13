import { Logo } from "@/components/common/Logo";
import { Input } from "@/components/common/Input";

export default function Login() {

    return (
        <main className="login-page">
            <div className="login-shell">
                <section className="login-brand" aria-label="Informações institucionais">
                    <div className="login-logo">
                        <Logo />
                    </div>
                    <div className="logo-divider" aria-hidden="true" />
                    <div className="brand-copy">
                        <p>
                            Plataforma corporativa para comissões e
                            automação de regras de negócio complexas.
                        </p>
                    </div>
                </section>

                <section className="login-panel" aria-label="Formulário de acesso">
                    <div className="login-card">
                        <h2>Acessar a Plataforma</h2>

                        <form className="login-form" noValidate>
                            <Input
                                id="tenantId"
                                placeholder="Empresa (Tenant ID)"
                                autoComplete="organization"
                            />

                            <Input
                                id="email"
                                placeholder="E-mail Corporativo"
                                type="email"
                                autoComplete="email"
                            />

                            <div className="password-wrapper">
                                <Input
                                    id="password"
                                    placeholder="Senha"
                                    type="password"
                                    autoComplete="current-password"
                                />
                                <a href="#recuperar" className="forgot-link">Esqueceu a senha?</a>
                            </div>

                            <button
                                type="submit"
                                className="login-submit"
                            >
                                Entrar no Sistema
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}