// src/features/configuracoes/components/ModuloSemanal.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

interface ModuloSemanalProps {
  dados: any;
  onSalvar: (novosDados: any) => void;
}

export function ModuloSemanal({ dados, onSalvar }: ModuloSemanalProps) {
  // Estados para gerenciar as 3 seções do JSON
  const [tecnicos, setTecnicos] = useState<Record<string, number>>({});
  const [retirada, setRetirada] = useState<Record<string, number>>({});
  const [autonomoPadrao, setAutonomoPadrao] = useState<number>(0);
  const [autonomoExcecoes, setAutonomoExcecoes] = useState<Record<string, number>>({});

  // Estado para a mensagem de feedback do salvamento
  const [notificacao, setNotificacao] = useState<{ mensagem: string; erro: boolean } | null>(null);

  // Monitora o carregamento e mudanças da prop 'dados' vinda do JSON externo
  useEffect(() => {
    if (dados?.fechamento_semanal) {
      const f = dados.fechamento_semanal;
      setTecnicos(f.tecnicos_terceirizados || {});
      setRetirada(f.retirada_estado || {});
      setAutonomoPadrao(f.autonomos?.valor_padrao || 0);
      setAutonomoExcecoes(f.autonomos?.excecoes || {});
    }
  }, [dados]);

  // Controle de Edição de Itens Existentes (Permite alterar o Nome/Estado e o Valor simultaneamente)
  const [editando, setEditando] = useState<{ categoria: string; chaveOriginal: string } | null>(null);
  const [valoresEdicao, setValoresEdicao] = useState({ nome: '', valor: '' });

  // Inputs para Novos Cadastros
  const [novosCampos, setNovosCampos] = useState({
    tecnicos: { nome: '', valor: '' },
    retirada: { nome: '', valor: '' },
    autonomos: { nome: '', valor: '' },
  });

  // --- Adicionar Novo Item ---
  const adicionarItem = (categoria: 'tecnicos' | 'retirada' | 'autonomos') => {
    const inputs = novosCampos[categoria];
    if (!inputs.nome || !inputs.valor) return;

    const chave = inputs.nome.toUpperCase().trim();
    const valorNum = Number(inputs.valor);

    if (categoria === 'tecnicos') setTecnicos(prev => ({ ...prev, [chave]: valorNum }));
    if (categoria === 'retirada') setRetirada(prev => ({ ...prev, [chave]: valorNum }));
    if (categoria === 'autonomos') setAutonomoExcecoes(prev => ({ ...prev, [chave]: valorNum }));

    setNovosCampos(prev => ({ ...prev, [categoria]: { nome: '', valor: '' } }));
  };

  // --- Remover Item ---
  const removerItem = (categoria: 'tecnicos' | 'retirada' | 'autonomos', nome: string) => {
    if (categoria === 'tecnicos') {
      setTecnicos(prev => { const c = { ...prev }; delete c[nome]; return c; });
    } else if (categoria === 'retirada') {
      setRetirada(prev => { const c = { ...prev }; delete c[nome]; return c; });
    } else if (categoria === 'autonomos') {
      setAutonomoExcecoes(prev => { const c = { ...prev }; delete c[nome]; return c; });
    }
    if (editando?.chaveOriginal === nome && editando?.categoria === categoria) setEditando(null);
  };

  // --- Salvar Alteração do Item em Edição (Atualiza chave e valor) ---
  const salvarEdicao = (categoria: 'tecnicos' | 'retirada' | 'autonomos') => {
    if (!valoresEdicao.nome || !valoresEdicao.valor || !editando) return;

    const novaChave = valoresEdicao.nome.toUpperCase().trim();
    const novoValor = Number(valoresEdicao.valor);
    const antigaChave = editando.chaveOriginal;

    const processarObjeto = (prev: any) => {
      const clone = { ...prev };
      delete clone[antigaChave]; // Deleta o nome antigo caso ele tenha sido renomeado
      clone[novaChave] = novoValor; // Aplica o novo nome com o novo valor
      return clone;
    };

    if (categoria === 'tecnicos') setTecnicos(prev => processarObjeto(prev));
    if (categoria === 'retirada') setRetirada(prev => processarObjeto(prev));
    if (categoria === 'autonomos') setAutonomoExcecoes(prev => processarObjeto(prev));

    setEditando(null);
  };

  // --- Despachar Alterações para o Componente Pai e Avisar se salvou ---
  const lidarComSalvarGeral = () => {
    try {
      onSalvar({
        ...dados,
        fechamento_semanal: {
          ...dados?.fechamento_semanal,
          tecnicos_terceirizados: tecnicos,
          retirada_estado: retirada,
          autonomos: {
            valor_padrao: Number(autonomoPadrao),
            excecoes: autonomoExcecoes
          }
        }
      });

      // Exibe mensagem de sucesso na tela
      setNotificacao({ mensagem: "Configurações salvas com sucesso!", erro: false });
    } catch (e) {
      // Caso ocorra algum erro inesperado no envio dos dados
      setNotificacao({ mensagem: "Erro ao tentar salvar as configurações.", erro: true });
    }

    // Esconde a mensagem automaticamente após 4 segundos
    setTimeout(() => setNotificacao(null), 4000);
  };

  // --- Renderização das Tabelas ---
  const renderizarTabela = (
    titulo: string,
    categoriaId: 'tecnicos' | 'retirada' | 'autonomos',
    listaDados: Record<string, number>,
    labelColunaPrincipal: string
  ) => {
    return (
      <div className="bg-[#05080f] rounded-xl border border-slate-800 overflow-hidden">
        {/* Cabeçalho do Bloco */}
        <div className="px-4 py-3 bg-[#090d16] border-b border-slate-800 flex justify-between items-center">
          <h4 className="text-sm font-semibold text-slate-200">{titulo}</h4>
          <span className="text-xs text-indigo-400 font-mono font-semibold">[+] Adicionar abaixo</span>
        </div>

        {/* Inputs de Criação (+) */}
        <div className="p-3 bg-[#03060b] border-b border-slate-800/60 flex gap-2">
          <input
            type="text"
            placeholder={`Inserir novo ${labelColunaPrincipal.toLowerCase()}...`}
            value={novosCampos[categoriaId].nome}
            onChange={e => setNovosCampos({
              ...novosCampos,
              [categoriaId]: { ...novosCampos[categoriaId], nome: e.target.value }
            })}
            className="bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs flex-1 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Valor R$"
            value={novosCampos[categoriaId].valor}
            onChange={e => setNovosCampos({
              ...novosCampos,
              [categoriaId]: { ...novosCampos[categoriaId], valor: e.target.value }
            })}
            className="bg-[#090d16] border border-slate-700 rounded-lg p-2 text-xs w-24 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => adicionarItem(categoriaId)}
            className="bg-indigo-600 hover:bg-indigo-500 px-3 rounded-lg text-white flex items-center justify-center transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Listagem das Linhas */}
        <div className="divide-y divide-slate-800/40 font-mono text-xs px-4">
          {/* Cabeçalho das Colunas */}
          <div className="grid grid-cols-12 py-2 text-slate-500 font-sans text-[11px] font-medium">
            <div className="col-span-6">{labelColunaPrincipal}</div>
            <div className="col-span-3 text-right">Valor</div>
            <div className="col-span-3 text-center">Ações</div>
          </div>

          {Object.entries(listaDados).length === 0 ? (
            <div className="text-slate-600 py-4 text-center italic font-sans">Nenhum registro configurado.</div>
          ) : (
            Object.entries(listaDados).map(([nome, valor]) => {
              const estaEditandoLinha = editando?.categoria === categoriaId && editando?.chaveOriginal === nome;

              return (
                <div key={nome} className="grid grid-cols-12 py-2.5 items-center gap-1">
                  {estaEditandoLinha ? (
                    // ✎ MODO EDIÇÃO: Altera o Nome/Estado e o Valor ao mesmo tempo
                    <>
                      <div className="col-span-6 pr-2">
                        <input
                          type="text"
                          value={valoresEdicao.nome}
                          onChange={e => setValoresEdicao({ ...valoresEdicao, nome: e.target.value })}
                          className="bg-[#0e1422] border border-indigo-500 rounded px-2 py-1 w-full text-slate-200 focus:outline-none font-sans"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={valoresEdicao.valor}
                          onChange={e => setValoresEdicao({ ...valoresEdicao, valor: e.target.value })}
                          className="bg-[#0e1422] border border-indigo-500 rounded px-2 py-1 w-full text-emerald-400 text-right focus:outline-none font-mono"
                        />
                      </div>
                      <div className="col-span-3 flex justify-center gap-2 pl-2">
                        {/* Botão de Check para confirmar o ajuste temporário na linha */}
                        <button 
                          onClick={() => salvarEdicao(categoriaId)} 
                          className="text-emerald-400 hover:text-emerald-300 p-1 bg-emerald-500/10 rounded"
                          title="Confirmar alteração nesta linha"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditando(null)} 
                          className="text-slate-400 hover:text-slate-300 text-[10px] font-sans px-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    // 👁 MODO VISUALIZAÇÃO PADRÃO
                    <>
                      <div className="col-span-6 text-slate-300 font-sans truncate">{nome}</div>
                      <div className="col-span-3 text-right text-emerald-400 font-semibold">R$ {valor.toFixed(2)}</div>
                      <div className="col-span-3 flex justify-center gap-4">
                        {/* Botão Editar (Canetinha) */}
                        <button
                          onClick={() => {
                            setEditando({ categoria: categoriaId, chaveOriginal: nome });
                            setValoresEdicao({ nome, valor: valor.toString() });
                          }}
                          className="text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Editar Nome e Valor"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {/* Botão Remover (Lixeira) */}
                        <button
                          onClick={() => removerItem(categoriaId, nome)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Remover Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Mensagem de Feedback flutuante na tela */}
      {notificacao && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-lg font-sans animate-bounce ${
          notificacao.erro 
            ? 'bg-red-950 border-red-800 text-red-200' 
            : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {notificacao.mensagem}
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-slate-200">Parâmetros Semanais</h3>
        <p className="text-xs text-slate-500">Visualize e edite os valores lidos diretamente do JSON configurado.</p>
      </div>

      <div className="space-y-6">
        {/* Bloco 1: Técnicos */}
        {renderizarTabela("Técnicos Terceirizados", "tecnicos", tecnicos, "Nome")}

        {/* Bloco 2: Retirada */}
        {renderizarTabela("Retirada", "retirada", retirada, "Estado")}

        {/* Bloco 3: Autônomos */}
        <div className="space-y-2">
          <div className="bg-[#05080f] rounded-xl border border-slate-800 p-4 flex justify-between items-center">
            <div>
              <span className="text-sm font-semibold text-slate-200 block">Autônomos</span>
              <span className="text-xs text-slate-500">Valor padrão cobrado de vendedores</span>
            </div>
            <div className="flex items-center gap-3 bg-[#090d16] border border-slate-800 px-3 py-2 rounded-xl">
              <span className="text-xs text-slate-400 font-medium font-sans">Valor Padrão:</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-emerald-400 font-mono font-bold">R$</span>
                <input
                  type="number"
                  value={autonomoPadrao}
                  onChange={e => setAutonomoPadrao(Number(e.target.value))}
                  className="bg-[#03060b] border border-slate-700 rounded-lg p-1 text-xs w-16 text-center text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Subtabela de Exceções dos Autônomos */}
          {renderizarTabela("Exceções de Autônomos", "autonomos", autonomoExcecoes, "Nome")}
        </div>
      </div>

      {/* Botão Salvar Geral */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={lidarComSalvarGeral}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-6 py-3 rounded-xl transition-colors shadow-md active:scale-95"
        >
          Salvar Geral
        </button>
      </div>
    </div>
  );
}