import { useState } from "react";
import { 
  Building2, Users, CalendarDays, CalendarClock, Download, Upload, 
  Save, Search, Plus, Trash2, ChevronRight, LayoutGrid 
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Can } from "@/features/auth/Can";

// 1. IMPORTAÇÕES DOS COMPONENTES MODULARES QUE CRIAMOS
import { ModuloHierarquia } from "./components/ModuloHierarquia";
import { ModuloSemanal } from "./components/ModuloSemanal";
import { ModuloMensal } from "./components/ModuloMensal";

// 2. IMPORTAÇÃO DO MOCK LOCAL DO SEU PROTÓTIPO
import mockRulesJson from "@/data/rules.json";

type MainSection = "empresas" | "equipes" | "semanal" | "mensal" | "backup";

export default function PainelConfiguracoes() {
  const [activeSection, setActiveSection] = useState<MainSection>("empresas");
  const [activeSubSection, setActiveSubSection] = useState<string>("geral");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtros de Escopo (Podem ser manipulados dentro dos componentes ou injetados)
  const [empresaContext] = useState<"AMAZONET" | "MANIA">("AMAZONET");
  const [unidadeContext] = useState<string>("MANAUS");

  // Estado que gerencia o JSON global completo
  const [globalRules, setGlobalRules] = useState(mockRulesJson);

  const handleExport = () => {
    alert("Configurações do ecossistema exportadas como JSON com sucesso!");
  };

  // Handler que centraliza a persistência local do JSON inteiro
  const handleSalvarConfiguracoes = () => {
    console.log("JSON final pronto para envio ao NestJS:", globalRules);
    alert("Configurações do módulo salvas com sucesso no JSON local!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Configuração do Ecossistema"
        subtitle="Gerencie parâmetros estruturais, regras de relatórios semanais/mensais e comissões por grupos."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* NAVEGAÇÃO DA ARQUITETURA (COLUNA ESQUERDA) */}
        <aside className="xl:col-span-3 bg-[#090d16] border border-slate-800 rounded-3xl p-4 space-y-2">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Módulos do Negócio
          </div>

          <button
            onClick={() => { setActiveSection("empresas"); setActiveSubSection("geral"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "empresas" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <Building2 className="h-4 w-4" />
            <span>Empresas (Amazonet/Mania)</span>
          </button>

          <button
            onClick={() => { setActiveSection("equipes"); setActiveSubSection("supervisores"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "equipes" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <Users className="h-4 w-4" />
            <span>Equipes e Hierarquias</span>
          </button>

          <button
            onClick={() => { setActiveSection("semanal"); setActiveSubSection("técnicos-terceirizados"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "semanal" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Relatório Semanal</span>
          </button>

          <button
            onClick={() => { setActiveSection("mensal"); setActiveSubSection("comercial"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "mensal" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <CalendarClock className="h-4 w-4" />
            <span>Relatório Mensal</span>
          </button>

          <div className="h-px bg-slate-800 my-4" />

          <button
            onClick={() => { setActiveSection("backup"); setActiveSubSection("json"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "backup" ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <Download className="h-4 w-4" />
            <span>Exportar / Importar</span>
          </button>
        </aside>

        {/* SUB-MENU E CONTEÚDO DINÂMICO (COLUNA DIREITA) */}
        <main className="xl:col-span-9 space-y-6">
          <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-6">
            
            {/* CONTEÚDO DINÂMICO: EMPRESAS */}
            {activeSection === "empresas" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Cadastro de Empresas</h3>
                    <p className="text-xs text-slate-500">Defina as organizações ativas no motor financeiro.</p>
                  </div>
                  <button className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                    <Plus className="h-3.5 w-3.5" /> Adicionar Empresa
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#05080f] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-slate-300 block">AMAZONET</span>
                      <span className="text-[10px] text-slate-500">Canais de Venda e Operação Técnica Ativos</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="bg-[#05080f] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-slate-300 block">MANIA</span>
                      <span className="text-[10px] text-slate-500">Operação Comercial Dedicada</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: EQUIPES / HIERARQUIAS PLUGADO */}
            {activeSection === "equipes" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Grupos de Comissão e Hierarquias</h3>
                  <p className="text-xs text-slate-500">Definição de supervisoras, líderes e subdivisões de vendas por Unidade ou Estado.</p>
                </div>
                
                {/* CHAMADA DO COMPONENTE REAL MODULAR */}
                <ModuloHierarquia 
                  empresa={empresaContext}
                  unidade={unidadeContext}
                  dadosGlobais={globalRules}
                  onSalvar={(novosDados) => setGlobalRules(novosDados)}
                />
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: RELATÓRIO SEMANAL PLUGADO */}
            {activeSection === "semanal" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Parâmetros do Fechamento Semanal</h3>
                  <p className="text-xs text-slate-500">Gerenciamento de regras de técnicos terceirizados, autônomos, retiradas e metas de cobrança.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs">
                  {["Técnicos Terceirizados", "Retirada", "Autônomos", "Venda de Técnicos", "Produção Técnica", "Cobrança"].map((sub) => (
                    <button 
                      key={sub}
                      onClick={() => setActiveSubSection(sub.toLowerCase().replace(/ /g, "-"))}
                      className={`px-3 py-1.5 rounded-lg border transition ${activeSubSection === sub.toLowerCase().replace(/ /g, "-") ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* FILTRO SUB-SEÇÃO USANDO O COMPONENTE MODULAR COMPLETO */}
                {activeSubSection === "técnicos-terceirizados" ? (
                  <ModuloSemanal 
                    dados={globalRules.fechamento_semanal}
                    onSalvar={(novosDadosSemanais) => {
                      setGlobalRules(prev => ({ ...prev, fechamento_semanal: novosDadosSemanais }));
                    }}
                  />
                ) : (
                  <div className="p-4 bg-[#05080f] border border-slate-800 rounded-xl text-xs text-slate-400">
                    Formulário de configuração ativa para o sub-módulo: <span className="text-slate-200 font-mono">{activeSubSection}</span>.
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: RELATÓRIO MENSAL PLUGADO */}
            {activeSection === "mensal" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Parâmetros do Fechamento Mensal</h3>
                  <p className="text-xs text-slate-500">Tabelas de comissões, faturamentos de supervisão, liderança corporativa e limites de metas de faturamento.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs">
                  {["Comercial", "Supervisão", "Liderança", "Metas"].map((sub) => (
                    <button 
                      key={sub}
                      onClick={() => setActiveSubSection(sub.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border transition ${activeSubSection === sub.toLowerCase() ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                {/* SE O FILTRO FOR COMERCIAL, CARREGA O COMPONENTE DAS METAS PYTHON */}
                {activeSubSection === "comercial" ? (
                  <ModuloMensal 
                    empresa={empresaContext}
                    unidade={unidadeContext}
                    dadosGlobais={globalRules}
                    onSalvar={(novosDados) => setGlobalRules(novosDados)}
                  />
                ) : (
                  <div className="p-4 bg-[#05080f] border border-slate-800 rounded-xl text-xs text-slate-400">
                    Módulo <span className="text-indigo-400 font-medium uppercase">{activeSubSection}</span> integrado à folha de fechamento mensal consolidada.
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: BACKUP */}
            {activeSection === "backup" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Gerenciamento da Configuração Raiz</h3>
                  <p className="text-xs text-slate-500">Importe ou exporte o ecossistema completo de regras de negócios em uma estrutura única JSON.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={handleExport}
                    className="p-4 bg-[#05080f] border border-slate-800 hover:border-emerald-500/40 rounded-2xl text-left transition space-y-2 group"
                  >
                    <Download className="h-5 w-5 text-emerald-500" />
                    <span className="block text-xs font-semibold text-slate-300 group-hover:text-emerald-400">Exportar Configurações</span>
                    <span className="block text-[11px] text-slate-500">Gere um backup estruturado contendo todas as metas do motor Python.</span>
                  </button>
                  <button className="p-4 bg-[#05080f] border border-slate-800 hover:border-indigo-500/40 rounded-2xl text-left transition space-y-2 group">
                    <Upload className="h-5 w-5 text-indigo-500" />
                    <span className="block text-xs font-semibold text-slate-300 group-hover:text-indigo-400">Importar Arquivo JSON</span>
                    <span className="block text-[11px] text-slate-500">Substitua as diretrizes operacionais carregando um novo arquivo mapeado.</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEU BOTÃO GLOBAL DE SALVAMENTO DE ALTERAÇÕES MANTIDO */}
            {activeSection !== "backup" && (
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-800">
                <button 
                  onClick={handleSalvarConfiguracoes}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10"
                >
                  <Save className="h-4 w-4" /> Salvar Configurações do Módulo
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}