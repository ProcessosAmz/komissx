import { Logo } from "@/components/common/Logo";

export function AsideBrand() {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-10 text-center lg:px-12 lg:py-16"
      aria-label="Informações institucionais"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at left 20%, rgba(59,130,246,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 mb-2 flex justify-center">
        <Logo className="[&_img]:h-[120px] [&_img]:w-auto sm:[&_img]:h-[160px] lg:[&_img]:h-[200px]" />
      </div>

      <div
        aria-hidden
        className="relative z-10 mb-8 h-0.5 w-64 max-w-[70vw] rounded-full bg-blue-500/80"
      />

      <div className="relative z-10 max-w-xl">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:mb-6 sm:text-5xl lg:text-6xl">
          KomissX
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
          Plataforma corporativa para comissões e automação de regras de
          negócio complexas.
        </p>
      </div>

      <div className="relative z-10 mt-8 flex items-center gap-2.5 text-sm text-slate-300 lg:absolute lg:bottom-10 lg:mt-0">
        <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-400" />
        Sistema online
      </div>
    </section>
  );
}