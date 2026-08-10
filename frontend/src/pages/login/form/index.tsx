import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { loginSchema, type LoginFormData } from "@/utils/validators/auth";
import { useLogin } from "@/hook/useLogin";

const inputClassName =
  "h-full min-h-[48px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 md:text-base";

export function LoginForm() {
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenantId: "amazonet",
      email: "",
      password: "",
    },
  });

  const isSubmitting = loginMutation.isPending;

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      setToast({ type: "success", message: response.message });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível autenticar agora. Tente novamente.";

      setError("root", { type: "manual", message });
      setToast({ type: "error", message });
    }
  };

  return (
    <>
      <LoginToast toast={toast} onClose={() => setToast(null)} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="login-form"
        noValidate
      >
        {errors.root?.message && (
          <p className="auth-error">{errors.root.message}</p>
        )}

        <div className="field">
          <label htmlFor="tenantId">Empresa (Tenant ID)</label>
          <div className="input-wrapper">
            <Input
              id="tenantId"
              placeholder="amazonet"
              autoComplete="organization"
              disabled={isSubmitting}
              className={inputClassName}
              {...register("tenantId")}
            />
          </div>
          {errors.tenantId?.message && (
            <p className="field-error">{errors.tenantId.message}</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">E-mail Corporativo</label>
          <div className="input-wrapper">
            <Input
              id="email"
              type="email"
              placeholder="nome@empresa.com"
              autoComplete="email"
              disabled={isSubmitting}
              className={inputClassName}
              {...register("email")}
            />
          </div>
          {errors.email?.message && (
            <p className="field-error">{errors.email.message}</p>
          )}
        </div>

        <div className="password-wrapper">
          <div className="field">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting}
                className={inputClassName}
                {...register("password")}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password?.message && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          <a href="#recuperar" className="forgot-link">
            Esqueceu a senha?
          </a>
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Autenticando..." : "Entrar no Sistema"}
        </button>
      </form>
    </>
  );
}