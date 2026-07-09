import { useState } from "react";
import { 
  Building2, Users, CalendarDays, CalendarClock, Download, Upload, 
  Save, Search, Plus, Trash2, ChevronRight, LayoutGrid 
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Can } from "@/features/auth/Can";

// Tipagem das seções para controle de navegação
type MainSection = "empresas" | "equipes" | "semanal" | "mensal" | "backup";

export default function PainelConfiguracoes() {
  const [activeSection, setActiveSection] = useState<MainSection>("empresas");
  const [activeSubSection, setActiveSubSection] = useState<string>("geral");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler fictício para simular a exportação/importação do JSON do negócio
  const handleExport = () => {
    alert("Configurações do ecossistema exportadas como JSON com sucesso!");
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

          {/* 1. Empresas */}
          <button
            onClick={() => { setActiveSection("empresas"); setActiveSubSection("geral"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "empresas" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <Building2 className="h-4 w-4" />
            <span>Empresas (Amazonet/Mania)</span>
          </button>

          {/* 2. Equipes */}
          <button
            onClick={() => { setActiveSection("equipes"); setActiveSubSection("vendedores"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "equipes" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <Users className="h-4 w-4" />
            <span>Equipes e Hierarquias</span>
          </button>

          {/* 3. Relatório Semanal */}
          <button
            onClick={() => { setActiveSection("semanal"); setActiveSubSection("tecnicos"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "semanal" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Relatório Semanal</span>
          </button>

          {/* 4. Relatório Mensal */}
          <button
            onClick={() => { setActiveSection("mensal"); setActiveSubSection("comercial"); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition ${activeSection === "mensal" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}
          >
            <CalendarClock className="h-4 w-4" />
            <span>Relatório Mensal</span>
          </button>

          <div className="h-px bg-slate-800 my-4" />

          {/* 5. Exportar / Importar */}
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
          
          {/* VISUALIZAÇÃO DO MÓDULO SELECIONADO */}
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

            {/* CONTEÚDO DINÂMICO: EQUIPES */}
            {activeSection === "equipes" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Grupos de Comissão e Hierarquias</h3>
                  <p className="text-xs text-slate-500">Definição de supervisoras, líderes e subdivisões de vendas por Unidade ou Estado.</p>
                </div>
                {/* Sub-Aba de Grupos */}
                <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs">
                  {["Supervisores", "Líderes", "Vendedores Internos", "Vendedores Externos", "Backoffice", "Regionais"].map((group) => (
                    <button 
                      key={group}
                      onClick={() => setActiveSubSection(group.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border transition ${activeSubSection === group.toLowerCase() ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-[#05080f] border border-slate-800 rounded-2xl text-xs text-slate-400">
                  Exibindo mapeamento dinâmico para o grupo <strong className="text-indigo-400 uppercase">{activeSubSection}</strong> por Unidade federativa.
                </div>
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: RELATÓRIO SEMANAL */}
            {activeSection === "semanal" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Parâmetros do Fechamento Semanal</h3>
                  <p className="text-xs text-slate-500">Gerenciamento de regras de técnicos terceirizados, autônomos, retiradas e metas de cobrança.</p>
                </div>
                
                {/* Sub-Aba de Fluxos Semanais */}
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

                {/* Render Condicional da Regra do Técnico baseado nos inputs originais */}
                {activeSubSection === "técnicos-terceirizados" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Filtro por padrão de nome (Ex: Lobatos = R$ 90,00)</span>
                      <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-md text-[11px]">Novo Vínculo</button>
                    </div>
                    <div className="border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] text-slate-300">
                      <div className="grid grid-cols-2 bg-[#05080f] p-2.5 border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                        <span>Padrão de Nome</span>
                        <span>Valor Fixo</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-800/50">
                        <span>*LOBATOS*</span>
                        <span className="text-indigo-400">R$ 90,00</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5 border-b border-slate-800/50">
                        <span>EDNELSON</span>
                        <span className="text-indigo-400">R$ 50,00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exibição padrão das outras subseções semanais */}
                {activeSubSection !== "técnicos-terceirizados" && (
                  <div className="p-4 bg-[#05080f] border border-slate-800 rounded-xl text-xs text-slate-400">
                    Formulário de configuração ativa para o módulo financeiro: <span className="text-slate-200 font-mono">{activeSubSection}</span>.
                  </div>
                )}
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: RELATÓRIO MENSAL */}
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
                <div className="p-4 bg-[#05080f] border border-slate-800 rounded-xl text-xs text-slate-400">
                  Módulo <span className="text-indigo-400 font-medium uppercase">{activeSubSection}</span> integrado à folha de fechamento mensal consolidada.
                </div>
              </div>
            )}

            {/* CONTEÚDO DINÂMICO: BACKUP / JSON GLOBAL */}
            {activeSection === "backup" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Gerenciamento da Configuração Raiz</h3>
                  <p className="text-xs text-slate-500">Importe ou exporte o ecossistema completo de regras de negócios em uma estrutura única JSON estável.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={handleExport}
                    className="p-4 bg-[#05080f] border border-slate-800 hover:border-emerald-500/40 rounded-2xl text-left transition space-y-2 group"
                  >
                    <Download className="h-5 w-5 text-emerald-500" />
                    <span className="block text-xs font-semibold text-slate-300 group-hover:text-emerald-400">Exportar Configurações</span>
                    <span className="block text-[11px] text-slate-500">Gere um backup estruturado contendo todas as metas, equipes e fixos de técnicos terceiros.</span>
                  </button>
                  <button className="p-4 bg-[#05080f] border border-slate-800 hover:border-indigo-500/40 rounded-2xl text-left transition space-y-2 group">
                    <Upload className="h-5 w-5 text-indigo-500" />
                    <span className="block text-xs font-semibold text-slate-300 group-hover:text-indigo-400">Importar Arquivo JSON</span>
                    <span className="block text-[11px] text-slate-500">Substitua as diretrizes operacionais do sistema carregando um novo mapeamento de regras.</span>
                  </button>
                </div>
              </div>
            )}

            {/* BOTÃO GLOBAL DE SALVAMENTO DE ALTERAÇÕES */}
            {activeSection !== "backup" && (
              <div className="flex justify-end pt-6 mt-6 border-t border-slate-800">
                <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/10">
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