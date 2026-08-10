import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";
import { AsideBrand } from "@/components/login";
import { LoginForm } from "@/pages/login/form";

export default function Login() {
  const navigate = useNavigate();
  const currentUser = useAuth((state) => state.user);

  useEffect(() => {
    if (currentUser) {
      navigate("/admin", { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <main className="login-page">
      <div className="login-shell">
        <AsideBrand />

        <section className="login-panel" aria-label="Formulário de acesso">
          <div className="login-card">
            <h2>Acessar a Plataforma</h2>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}