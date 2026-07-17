import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, PERMISSOES } from "@/stores/auth.store";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PainelConfiguracoes from "./pages/PainelConfiguracoes";
import AcademyPage from "./pages/Academy";
import { DefaultLayout } from "./layouts/DefaultLayout";

// IMPORTAÇÕES DOS FECHAMENTOS
import FechamentosHub from "./pages/Fechamentos";
import FechamentoTecnico from "./pages/Fechamentos/tecnico";

// IMPORTAÇÕES CORRIGIDAS (Utilizando chaves {} para exports nomeados)
import { ModuloHierarquia } from "./features/configuracoes/components/ModuloHierarquia";
import { ModuloSemanal } from "./features/configuracoes/components/ModuloSemanal";
import { ModuloMensal } from "./features/configuracoes/components/ModuloMensal";
import ModuloAcesso from "./features/configuracoes/components/ModuloAcesso"; // Mantido padrão (export default)

// Guard de Autenticação Global e Rota Base Admin
function PrivateLayout() {
  const user = useAuth((s) => s.user);

  if (!user) return <Navigate to="/autenticacao" replace />;

  return <DefaultLayout />;
}

// Guard Específico para Módulos Filhos
function PermissionGuard({ modulo, children }: { modulo: keyof typeof PERMISSOES; children: React.ReactNode }) {
  const user = useAuth((s) => s.user);

  if (!user) return <Navigate to="/autenticacao" replace />;

  const temAcesso = PERMISSOES[modulo](user.role);

  if (!temAcesso) {
    return <Navigate to="/admin/academy" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Navigate to="/autenticacao" replace />} />
        <Route path="/autenticacao" element={<Login />} />

        {/* Único Bloco Pai Protegido para a rota /admin */}
        <Route path="/admin" element={<PrivateLayout />}>
          <Route index element={<Navigate to="academy" replace />} />

          {/* 1. MÓDULO ACADEMY */}
          <Route path="academy" element={
            <PermissionGuard modulo="academy">
              <AcademyPage />
            </PermissionGuard>
          } />

          {/* 2. MÓDULO DASHBOARD/PRODUÇÃO */}
          <Route path="dashboard" element={
            <PermissionGuard modulo="producao">
              <Dashboard />
            </PermissionGuard>
          } />
          <Route path="equipes" element={
            <PermissionGuard modulo="producao">
              <div className="text-white p-6">Visualização de Equipes.</div>
            </PermissionGuard>
          } />

          {/* 3. MÓDULO FECHAMENTOS */}
          <Route path="fechamentos">
            <Route index element={
              <PermissionGuard modulo="fechamento">
                <FechamentosHub />
              </PermissionGuard>
            } />
            <Route path="tecnico" element={
              <PermissionGuard modulo="fechamento">
                <FechamentoTecnico />
              </PermissionGuard>
            } />
          </Route>

          {/* 4. PAINEL DE CONFIGURAÇÕES */}
          <Route path="configuracoes" element={
            <PermissionGuard modulo="configuracoes">
              <PainelConfiguracoes />
            </PermissionGuard>
          }>
            <Route index element={<Navigate to="empresas" replace />} />

            {/* Sub-rotas ligadas aos componentes da pasta features */}
            <Route path="empresas" element={<div className="text-slate-400 text-xs italic">Módulo de Empresas.</div>} />
            <Route path="equipes" element={<ModuloHierarquia />} />
            <Route path="semanal" element={<ModuloSemanal />} />

            {/* Corrigido para repassar propriedades vazias iniciais de fallback, evitando quebras */}
            <Route path="mensal" element={<ModuloMensal jsonOriginal={{}} onSalvar={() => { }} />} />

            <Route path="acessos" element={<ModuloAcesso users={[]} onUpdateUsers={() => { }} />} />
            <Route path="backup" element={<div className="text-slate-400 text-xs italic">Módulo de Exportação e Backup.</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/autenticacao" replace />} />
      </Routes>
    </BrowserRouter>
  );
}