import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MotorRegras from "./pages/MotorRegras";
import { DefaultLayout } from "./components/layout/DefaultLayout";
import { useAuth } from "./stores/auth.store";

function Protected() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/autenticacao" replace />;
  return <DefaultLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/autenticacao" replace />} />
        <Route path="/login" element={<Navigate to="/autenticacao" replace />} />
        <Route path="/autenticacao" element={<Login />} />

        <Route path="/admin" element={<Protected />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="equipes" element={<Placeholder name="Equipes" />} />
          <Route path="fechamentos" element={<Placeholder name="Fechamentos" />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">{name}</h2>
        <p className="text-sm text-slate-500 mt-2">Em construção.</p>
      </div>
    </div>
  );
}
