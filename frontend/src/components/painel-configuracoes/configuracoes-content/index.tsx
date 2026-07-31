import { Outlet } from "react-router-dom";

interface ConfiguracoesContentProps {
  context: Record<string, unknown>;
}

export function ConfiguracoesContent({ context }: ConfiguracoesContentProps) {
  return (
    <main className="xl:col-span-9 space-y-6">
      <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
        <Outlet context={context} />
      </div>
    </main>
  );
}