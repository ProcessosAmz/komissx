import { Link } from "react-router-dom";

import { POST_LOGIN_ROUTE } from "@/const/auth";
import { useAuth } from "@/hooks/useAuth.ts";

export default function Forbidden() {
    const { user } = useAuth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050b18] px-6 text-center text-slate-50">
            <p className="text-6xl font-extrabold text-amber-400">403</p>
            <h1 className="text-2xl font-bold">Acesso não autorizado</h1>
            <p className="max-w-md text-slate-400">
                O perfil {user?.role ?? "atual"} não tem permissão para este módulo.
                Procure o administrador se precisar de acesso.
            </p>
            <Link
                to={POST_LOGIN_ROUTE}
                className="mt-2 rounded-[14px] border border-white/10 px-6 py-3 font-semibold text-white hover:bg-white/5"
            >
                Voltar ao sistema
            </Link>
        </main>
    );
}