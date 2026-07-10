import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from "react-router-dom";
import { useAuth } from "@/stores/auth.store";

// 1. IMPORTS DAS PÁGINAS E LAYOUTS
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PainelConfiguracoes from "./pages/PainelConfiguracoes"; 
import { DefaultLayout } from "./layouts/DefaultLayout";

// 2. IMPORTS DOS COMPONENTES MODULARES
import { ModuloHierarquia } from "./features/configuracoes/components/ModuloHierarquia";
import { ModuloSemanal } from "./features/configuracoes/components/ModuloSemanal";
import { ModuloMensal } from "./features/configuracoes/components/ModuloMensal";

// ==========================================
// 3. DEFINIÇÃO DE TIPOS GLOBAL (NO TOPO)
// ==========================================
export type ContextType = { 
  globalRules: any; 
  onSalvar: (dados: any) => void; 
};

const EMPRESA_PADRAO = "AMAZONET";
const UNIDADE_PADRAO = "MANAUS";

// ==========================================
// 4. WRAPPERS PARA CONECTAR OS MÓDULOS AO OUTLET CONTEXT
// ==========================================
function ModuloHierarquiaWrapper() {
  const { globalRules, onSalvar } = useOutletContext<ContextType>();
  return (
    <ModuloHierarquia 
      empresa={EMPRESA_PADRAO} 
      unidade={UNIDADE_PADRAO} 
      dadosGlobais={globalRules} 
      onSalvar={onSalvar} 
    />
  );
}

function ModuloSemanalWrapper() {
  const { globalRules, onSalvar } = useOutletContext<ContextType>();
  return (
    <ModuloSemanal 
      dados={globalRules} 
      onSalvar={onSalvar} 
    />
  );
}

// Se o seu ModuloMensal não aceitar "empresa" ou "unidade" no componente atual, 
// você pode remover essas duas propriedades abaixo deixando apenas dadosGlobais={globalRules} e onSalvar={onSalvar}
function ModuloMensalWrapper() {
  const { globalRules, onSalvar } = useOutletContext<ContextType>();
  return (
    <ModuloMensal 
      empresa={EMPRESA_PADRAO} 
      unidade={UNIDADE_PADRAO} 
      dadosGlobais={globalRules} 
      onSalvar={onSalvar} 
    />
  );
}

// ==========================================
// 5. COMPONENTES DE SUPORTE (GUARD E PLACEHOLDER)
// ==========================================
function Protected() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/autenticacao" replace />;
  return <DefaultLayout />;
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

// ==========================================
// 6. COMPONENTE PRINCIPAL DO APP
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Navigate to="/autenticacao" replace />} />
        <Route path="/login" element={<Navigate to="/autenticacao" replace />} />
        <Route path="/autenticacao" element={<Login />} />

        {/* Rotas Privadas (Admin) */}
        <Route path="/admin" element={<Protected />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* PAINEL DE CONFIGURAÇÕES (MOTOR DE REGRAS) */}
          <Route path="motor-de-regras" element={<PainelConfiguracoes />}>
            <Route index element={<Navigate to="empresas" replace />} /> 
            
            {/* Sub-rotas modulares */}
            <Route path="empresas" element={<div className="text-slate-400 text-xs italic">Módulo de Empresas em construção.</div>} />
            <Route path="equipes" element={<ModuloHierarquiaWrapper />} />
            <Route path="semanal" element={<ModuloSemanalWrapper />} />
            <Route path="mensal" element={<ModuloMensalWrapper />} />
            <Route path="backup" element={<div className="text-slate-400 text-xs italic">Módulo de Backup em construção.</div>} />
          </Route>

          <Route path="equipes" element={<Placeholder name="Equipes" />} />
          <Route path="fechamentos" element={<Placeholder name="Fechamentos" />} />
        </Route>

        {/* Fallback Global */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}