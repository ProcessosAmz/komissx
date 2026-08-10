import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from "@/utils/validators/auth";
import { useLogin } from "@/hook/useLogin";

const inputClassName =
  "h-12 border-0 bg-transparent px-0 text-base text-white shadow-none placeholder:text-slate-500 focus-visible:ring-0";

const fieldWrapperClassName =
  "flex min-h-14 items-center rounded-xl border border-white/10 bg-[#080e14c7] px-5 transition hover:border-white/20 focus-within:border-blue-500";

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
      await loginMutation.mutateAsync(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível autenticar agora. Tente novamente.";

      setError("root", { type: "manual", message });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
      noValidate
    >
      {errors.root?.message && (
        <p className="rounded-xl border border-red-500/35 bg-red-500/10 px-3.5 py-3 text-sm font-semibold text-red-300">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="tenantId"
          className="text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          Empresa (Tenant ID)
        </label>
        <div className={fieldWrapperClassName}>
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
          <p className="text-xs font-semibold text-red-300">
            {errors.tenantId.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          E-mail Corporativo
        </label>
        <div className={fieldWrapperClassName}>
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
          <p className="text-xs font-semibold text-red-300">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          Senha
        </label>
        <div className={fieldWrapperClassName}>
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
            className="flex h-full w-12 shrink-0 items-center justify-center text-slate-400 hover:text-white"
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
          <p className="text-xs font-semibold text-red-300">
            {errors.password.message}
          </p>
        )}

        <a
          href="#recuperar"
          className="w-fit text-sm font-semibold text-blue-400 hover:text-white hover:underline"
        >
          Esqueceu a senha?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-lg font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "Autenticando..." : "Entrar no Sistema"}
      </button>
    </form>
  );
}