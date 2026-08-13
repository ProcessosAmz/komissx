import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hook/useLogin";

const inputStyles =
  "h-12 w-full rounded-[14px] border border-white/[0.08] bg-[#080e1c]/[0.78] px-4 text-base leading-[1.4] text-white shadow-none transition-colors placeholder:text-[#6f7b92] hover:border-white/[0.14] focus-visible:border-[#4f73ff] focus-visible:ring-1 focus-visible:ring-[#4f73ff] focus-visible:shadow-[0_0_24px_rgba(79,115,255,0.2)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:px-6 sm:text-lg";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="text-sm font-medium text-red-400">
      {message}
    </p>
  );
}

export function LoginForm() {
  const { register, errors, isSubmitting, onSubmit } = useLogin();

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex w-full flex-col items-stretch gap-4 sm:gap-[22px]"
    >
      <div className="flex flex-col gap-2">
        <Input
          id="email"
          type="email"
          placeholder="E-mail Corporativo"
          autoComplete="email"
          disabled={isSubmitting}
          className={inputStyles}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Input
          id="password"
          type="password"
          placeholder="Senha"
          autoComplete="current-password"
          disabled={isSubmitting}
          className={inputStyles}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border-0 bg-[linear-gradient(90deg,#3b5cff,#5d7cff,#3b5cff)] bg-[length:200%_auto] text-base font-semibold text-white shadow-[0_10px_30px_rgba(61,95,255,0.22)] transition-all duration-[250ms] ease-in disabled:cursor-not-allowed disabled:opacity-70 enabled:hover:-translate-y-0.5 enabled:hover:bg-right enabled:hover:shadow-[0_14px_40px_rgba(59,130,246,0.45)] sm:h-14 sm:text-xl"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Autenticando...
          </>
        ) : (
          "Entrar no Sistema"
        )}
      </Button>
    </form>
  );
}