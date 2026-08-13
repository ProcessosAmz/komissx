import { Logo } from "@/components/common/Logo";
import { Input } from "@/components/ui/input";

const inputStyles =
  "h-12 w-full rounded-[14px] border border-white/[0.08] bg-[#080e1c]/[0.78] px-6 text-[clamp(16px,1.6vw,18px)] leading-[1.4] text-white shadow-none transition-colors placeholder:text-[#6f7b92] hover:border-white/[0.14] focus-visible:border-[#4f73ff] focus-visible:ring-1 focus-visible:ring-[#4f73ff] focus-visible:shadow-[0_0_24px_rgba(79,115,255,0.2)] md:text-[clamp(16px,1.6vw,18px)] min-[481px]:h-[72px]";

export default function Login() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(90deg,#050b18_0%,#071124_35%,#040a17_100%)] text-slate-50">
      <div className="grid min-h-screen grid-cols-1 items-stretch lg:grid-cols-[minmax(220px,40%)_1fr] min-[1401px]:grid-cols-[minmax(280px,44%)_1fr]">
        <section
          aria-label="Informações institucionais"
          className="relative flex flex-col items-center justify-center gap-8 overflow-hidden border-b border-white/[0.08] px-6 pb-10 pt-[60px] text-center before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_left_20%,rgba(59,130,246,0.08),transparent_60%)] before:content-[''] lg:-translate-y-[100px] lg:gap-0 lg:border-b-0 lg:p-[50px]"
        >
          <div className="relative z-[3] -mb-[35px] [&_img]:block [&_img]:h-[clamp(320px,28vw,400px)] [&_img]:w-auto [&_img]:translate-x-2 lg:ml-[clamp(0px,10vw,250px)]">
            <Logo />
          </div>

          <div className="relative z-[2] max-w-[600px] lg:ml-[clamp(0px,10vw,250px)]">
            <p className="max-w-[600px] text-[clamp(16px,2vw,24px)] font-normal leading-[1.7] text-[#d6deff]/85">
              Plataforma corporativa para comissões e automação de regras de
              negócio complexas.
            </p>
          </div>
        </section>

        <section
          aria-label="Formulário de acesso"
          className="flex items-center justify-center px-4 py-6 min-[481px]:px-6 min-[481px]:py-12 lg:px-5 lg:pb-12 lg:pt-9"
        >
          <div className="w-[min(100%,720px)] max-w-[680px] -translate-y-[60px] rounded-3xl px-4 py-8 min-[481px]:border min-[481px]:border-white/10 min-[481px]:bg-[#0a0f1e]/95 min-[481px]:px-14 min-[481px]:py-[72px] min-[481px]:shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
            <h2 className="mb-6 text-center text-2xl font-extrabold tracking-[0.6px] text-white min-[481px]:mb-7 min-[481px]:text-[34px]">
              Acessar a Plataforma
            </h2>

            <form className="flex w-full flex-col items-stretch gap-[22px]">
              <Input
                id="email"
                placeholder="E-mail Corporativo"
                type="email"
                autoComplete="email"
                className={inputStyles}
              />

              <div className="flex flex-col items-stretch gap-[10px]">
                <Input
                  id="password"
                  placeholder="Senha"
                  type="password"
                  autoComplete="current-password"
                  className={inputStyles}
                />
                <a
                  href="#recuperar"
                  className="self-start whitespace-nowrap text-base text-[#5d7cff] no-underline hover:text-white hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                className="mt-2 h-12 w-full cursor-pointer rounded-[14px] border-0 bg-[linear-gradient(90deg,#3b5cff,#5d7cff,#3b5cff)] bg-[length:200%_auto] text-xl font-semibold text-white shadow-[0_10px_30px_rgba(61,95,255,0.22)] transition-all duration-[250ms] ease-in enabled:hover:-translate-y-0.5 enabled:hover:bg-right enabled:hover:shadow-[0_14px_40px_rgba(59,130,246,0.45)] min-[481px]:h-[52px]"
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