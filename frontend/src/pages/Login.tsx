import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import "../components/styles/Login.css";

import { Input } from "../components/ui/input";
import { Logo } from "../components/common/Logo";
import { loginSchema, type LoginFormData } from "../utils/validators/auth";
import { useAuth, type Role, mockUsuariosTestes } from "../stores/auth.store"; // 🚀 CORREÇÃO: Importando a massa de dados atualizada da store
import type { User } from "../engine/types";

/* ---------------- Tipos internos ---------------- */

interface UserRecord extends User {
  password?: string;
}

// 🚀 CORREÇÃO: Agora o Login lê os mocks corretos que possuem os operadores A e B
const USERS = mockUsuariosTestes as UserRecord[];

/* ---------------- Toast inline ---------------- */

type Toast = { type: "error" | "success"; message: string } | null;

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const styles =
    toast.type === "error"
      ? "border-red-500/40 bg-red-500/10 text-red-300"
      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";

  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="polite"
      className={`fixed top-6 right-6 z-50 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${styles}`}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}

/* ---------------- Componente principal ---------------- */

export default function Login() {
  const navigate = useNavigate();

  const setUser = useAuth((s) => s.login);
  const currentUser = useAuth((s) => s.user);
  const [toast, setToast] = useState<Toast | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantId: "amazonet", email: "", password: "" },
  });

  useEffect(() => {
    if (currentUser) {
      navigate("/admin", { replace: true });
    }
  }, [currentUser, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await new Promise((r) => setTimeout(r, 400));

      const tenantId = data.tenantId.trim().toLowerCase();
      const email = data.email.trim().toLowerCase();

      const found = USERS.find(
        (u) =>
          u.active &&
          u.tenantId.toLowerCase() === tenantId &&
          u.email.toLowerCase() === email &&
          u.password === data.password
      );

      if (!found) {
        setError("root", {
          type: "manual",
          message: "Empresa, e-mail ou senha inválidos.",
        });
        setToast({ type: "error", message: "Credenciais inválidas." });
        return;
      }

      const { password: _password, ...sessionUser } = found;

      // 🚀 CORREÇÃO CRÍTICA: Adicionado 'OPERADOR' na lista permitida pelo formulário
      const rolesPermitidas: Role[] = ["ADMIN", "GERENTE", "SUPERVISORA", "LIDER", "TECNICO", "ESTUDANTE", "OPERADOR"];

      if (!rolesPermitidas.includes(sessionUser.role as Role)) {
        setError("root", {
          type: "manual",
          message: "Perfil de usuário não parametrizado no sistema.",
        });
        return;
      }

      setUser(sessionUser as User);
      setToast({ type: "success", message: `Bem-vindo, ${sessionUser.name}!` });

      // O redirecionamento genérico '/admin' vai bater no RootRedirect inteligente que criamos no App.tsx
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error(err);
      setError("root", {
        type: "manual",
        message: "Não foi possível autenticar agora. Tente novamente.",
      });
      setToast({ type: "error", message: "Falha de autenticação." });
    }
  };

  return (
    <main className="login-page">
      <Toast toast={toast} onClose={() => setToast(null)} />

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

            <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
              {errors.root?.message && (
                <p className="auth-error">{errors.root.message}</p>
              )}

              <Input
                id="tenantId"
                label="Empresa (Tenant ID)"
                placeholder="amazonet"
                error={errors.tenantId?.message}
                register={register("tenantId")}
                disabled={isSubmitting}
                autoComplete="organization"
              />

              <Input
                id="email"
                label="E-mail Corporativo"
                type="email"
                placeholder="nome@empresa.com"
                error={errors.email?.message}
                register={register("email")}
                disabled={isSubmitting}
                autoComplete="email"
              />

              <div className="password-wrapper">
                <Input
                  id="password"
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  register={register("password")}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <a href="#recuperar" className="forgot-link">Esqueceu a senha?</a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-submit"
              >
                {isSubmitting ? "Autenticando..." : "Entrar no Sistema"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}