import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, PERMISSOES } from "@/stores/auth.store";
import Login from "@/pages/login/index";

import Dashboard from "./pages/Dashboard";
import PainelConfiguracoes from "@/pages/painel-configuracoes";
import AcademyPage from "./pages/Academy";
import { DefaultLayout } from "./layouts/DefaultLayout";
import AdminLayout from "./layouts/AdminLayout";

import HubFechamentos from './pages/Fechamentos';
import Tecnicos from './pages/Fechamentos/semanal/tecnicos';
import Retirada from './pages/Fechamentos/semanal/retirada';
import Autonomos from './pages/Fechamentos/semanal/autonomos';

import Comercial from './pages/Fechamentos/mensal/comercial';
import Producao from './pages/Fechamentos/mensal/producao';
import ComercialPJ from './pages/Fechamentos/mensal/comercial-pj';
import Cobranca from './pages/Fechamentos/mensal/cobranca';

import { ModuloHierarquia } from "./components/painel-configuracoes/modulos/negocio-view/hierarquia";
import { ModuloSemanal } from "./features/configuracoes/components/ModuloSemanal";
import { ModuloMensal } from "./features/configuracoes/components/ModuloMensal";
import ModuloAcesso from "./features/configuracoes/components/ModuloAcesso";

// Componente inteligente de Redirecionamento Inicial Pós-Login
function RootRedirect() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/autenticacao" replace />;

  // Descobre dinamicamente qual a primeira tela que este usuário tem direito de ver
  if (PERMISSOES.producao(user.role)) return <Navigate to="dashboard" replace />;
  if (PERMISSOES.academy(user.role)) return <Navigate to="academy" replace />;
  if (PERMISSOES.fechamento(user.role)) return <Navigate to="fechamentos" replace />;

  return <Navigate to="/autenticacao" replace />;
}

function PrivateLayout() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/autenticacao" replace />;
  return <DefaultLayout />;
}

function PermissionGuard({ modulo, children }: { modulo: keyof typeof PERMISSOES; children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/autenticacao" replace />;

  const temAcesso = PERMISSOES[modulo](user.role);
  if (!temAcesso) {
    // Se não tem acesso, joga para a raiz inteligente decidir para onde ele vai
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function TelaFechamentoGuard({ tela, children }: { tela: string; children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === 'ADMIN') return <>{children}</>;

  const temPermissao = user.telas_fechamento?.includes(tela);
  if (!temPermissao) return <Navigate to="/admin/fechamentos" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Login />} />

        <Route path="/admin" element={<PrivateLayout />}>
          {/* O index agora calcula dinamicamente para onde o usuário deve ir */}
          <Route index element={<RootRedirect />} />

          {/* 1. MÓDULO DASHBOARD/PRODUÇÃO */}
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

          {/* 2. MÓDULO ACADEMY */}
          <Route path="academy" element={
            <PermissionGuard modulo="academy">
              <AcademyPage />
            </PermissionGuard>
          } />

          {/* 3. MÓDULO FECHAMENTOS */}
          <Route path="fechamentos" element={
            <PermissionGuard modulo="fechamento">
              <Outlet />
            </PermissionGuard>
          }>
            <Route index element={<HubFechamentos />} />
            <Route element={<AdminLayout />}>
              <Route path="semanal">
                <Route path="tecnicos" element={<TelaFechamentoGuard tela="semanal_tecnico"><Tecnicos /></TelaFechamentoGuard>} />
                <Route path="retirada" element={<TelaFechamentoGuard tela="semanal_retirada"><Retirada /></TelaFechamentoGuard>} />
                <Route path="autonomos" element={<TelaFechamentoGuard tela="semanal_autonomo"><Autonomos /></TelaFechamentoGuard>} />
              </Route>
              <Route path="mensal">
                <Route path="comercial" element={<TelaFechamentoGuard tela="mensal_comercial"><Comercial /></TelaFechamentoGuard>} />
                <Route path="producao" element={<TelaFechamentoGuard tela="mensal_producao"><Producao /></TelaFechamentoGuard>} />
                <Route path="comercial-pj" element={<TelaFechamentoGuard tela="mensal_pj"><ComercialPJ /></TelaFechamentoGuard>} />
                <Route path="cobranca" element={<TelaFechamentoGuard tela="mensal_cobranca"><Cobranca /></TelaFechamentoGuard>} />
              </Route>
            </Route>
          </Route>

          {/* 4. PAINEL DE CONFIGURAÇÕES */}
          <Route path="configuracoes" element={
            <PermissionGuard modulo="configuracoes">
              <PainelConfiguracoes />
            </PermissionGuard>
          }>
            <Route index element={<Navigate to="empresas" replace />} />
            <Route path="empresas" element={<div className="text-slate-400 text-xs italic">Módulo de Empresas.</div>} />
            <Route path="equipes" element={<ModuloHierarquia />} />
            <Route path="semanal" element={<ModuloSemanal />} />
            <Route path="mensal" element={<ModuloMensal jsonOriginal={{}} onSalvar={() => { }} />} />
            <Route path="acessos" element={<ModuloAcesso users={[]} onUpdateUsers={() => { }} />} />
            <Route path="backup" element={<div className="text-slate-400 text-xs italic">Módulo de Exportação e Backup.</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}