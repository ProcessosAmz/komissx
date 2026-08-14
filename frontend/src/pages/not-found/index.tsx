import { Link } from "react-router-dom";

import { SessionLoader } from "@/components/common/sessionLoader";
import { LOGIN_ROUTE, POST_LOGIN_ROUTE } from "@/const/auth";
import { useAuth } from "@/hooks/useAuth.ts";

export default function NotFound() {
    const { isAuthenticated, isPending } = useAuth();

    if (isPending) return <SessionLoader />;

    const destination = isAuthenticated ? POST_LOGIN_ROUTE : LOGIN_ROUTE;
    const label = isAuthenticated ? "Voltar ao sistema" : "Ir para o login";

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#050b18] px-6 text-center text-slate-50">
            <p className="text-6xl font-extrabold text-[#3b5cff]">404</p>
            <h1 className="text-2xl font-bold">Página não encontrada</h1>
            <p className="max-w-md text-slate-400">
                O endereço acessado não existe ou foi movido.
            </p>
            <Link
                to={destination}
                className="mt-2 rounded-[14px] bg-[linear-gradient(90deg,#3b5cff,#5d7cff)] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
                {label}
            </Link>
        </main>
    );
}