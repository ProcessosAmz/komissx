import { Logo } from "@/components/common/logo";
import { LoginForm } from "@/components/login/form";

export default function Login() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(90deg,#050b18_0%,#071124_35%,#040a17_100%)] text-slate-50">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(240px,42%)_1fr]">
        <section
          aria-label="Informações institucionais"
          className="relative hidden overflow-hidden px-8 py-12 text-center lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-6 lg:px-12 xl:px-16"
        >
          <div className="relative z-[2] flex max-w-[420px] flex-col items-center">
            <Logo className="login-logo [&_img]:h-[clamp(140px,18vw,220px)] [&_img]:w-auto" />
            <p className="mt-6 text-lg font-normal leading-relaxed text-[#d6deff]/85 xl:text-2xl">
              Plataforma corporativa para comissões e automação de regras de
              negócio complexas.
            </p>
          </div>
        </section>

        <section
          aria-label="Formulário de acesso"
          className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-10"
        >
          <div className="w-full max-w-[440px] rounded-3xl border border-white/10 bg-[#0a0f1e]/95 px-5 py-8 shadow-[0_28px_100px_rgba(0,0,0,0.45)] sm:max-w-[520px] sm:px-10 sm:py-12 lg:max-w-[560px] lg:px-12 lg:py-14">
            <div className="mb-6 flex justify-center lg:hidden">
              <Logo className="login-logo [&_img]:h-16 [&_img]:w-auto sm:[&_img]:h-20" />
            </div>

            <h2 className="mb-6 text-center text-xl font-extrabold tracking-[0.6px] text-white sm:mb-7 sm:text-2xl lg:text-[34px]">
              Acessar a Plataforma
            </h2>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}