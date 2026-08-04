import { useState } from "react";
import { useMemo } from "react";
import { Filtro } from "./filtro";
import { HierarquiaNode } from "@/types/cargo";
import { contarNos, encontrarNo } from "@/utils/hierarquia";
import { ArvoreHierarquica } from "./arvore";
import { DetalheColaborador } from "./detalhe";

// TODO: Remover mock e usar API
const MOCK_TREE: HierarquiaNode[] = [
  {
    id: "1",
    nome: "Jessica Martins",
    email: "jessica@amazonet.com",
    cargo: "SUPERVISOR",
    operadora: "AMAZONET",
    regional: "MANAUS",
    idHubsoft: "1001",
    participaFechamento: true,
    children: [
      {
        id: "1-1",
        nome: "Carlos Mendes",
        email: "carlos@amazonet.com",
        cargo: "LIDER",
        operadora: "AMAZONET",
        regional: "MANAUS",
        idHubsoft: "1002",
        participaFechamento: true,
        children: [
          {
            id: "1-1-1",
            nome: "Ana Souza",
            email: "ana@amazonet.com",
            cargo: "TECNICO",
            operadora: "AMAZONET",
            regional: "MANAUS",
            idHubsoft: "1003",
            participaFechamento: false,
          },
          {
            id: "1-1-2",
            nome: "Pedro Lima",
            email: "pedro@amazonet.com",
            cargo: "AUTONOMO",
            operadora: "AMAZONET",
            regional: "MANAUS",
            idHubsoft: "1004",
            participaFechamento: false,
          },
        ],
      },
      {
        id: "1-2",
        nome: "Mariana Costa",
        email: "mariana@amazonet.com",
        cargo: "LIDER",
        operadora: "AMAZONET",
        regional: "MANAUS",
        idHubsoft: "1005",
        participaFechamento: true,
        children: [
          {
            id: "1-2-1",
            nome: "João Alves",
            email: "joao@amazonet.com",
            cargo: "TECNICO",
            operadora: "AMAZONET",
            regional: "MANAUS",
            idHubsoft: "1006",
            participaFechamento: false,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    nome: "Roberto Dias",
    email: "roberto@amazonet.com",
    cargo: "SUPERVISOR",
    operadora: "AMAZONET",
    regional: "MANAUS",
    idHubsoft: "1007",
    participaFechamento: true,
    children: [
      {
        id: "2-1",
        nome: "Fernanda Rocha",
        email: "fernanda@amazonet.com",
        cargo: "LIDER",
        operadora: "AMAZONET",
        regional: "MANAUS",
        idHubsoft: "1008",
        participaFechamento: true,
      },
    ],
  },
];


export function ModuloHierarquia() {
  const [selecionadoId, setSelecionadoId] = useState("1");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({
    "1": true,
    "1-1": true,
    "1-2": true,
    "2": true,
  });
  const totalRegistros = useMemo(() => contarNos(MOCK_TREE), []);
  const selecionado = encontrarNo(MOCK_TREE, selecionadoId);
  const onToggle = (id: string) => {
    setAbertos((atual) => ({ ...atual, [id]: !(atual[id] ?? false) }));
  };
  return (
    <div className="space-y-6 text-slate-200 antialiased font-sans">
      <Filtro />
      <div className="flex justify-between gap-4">
        <ArvoreHierarquica
          nos={MOCK_TREE}
          totalRegistros={totalRegistros}
          selecionadoId={selecionadoId}
          abertos={abertos}
          onToggle={onToggle}
          onSelect={setSelecionadoId}
        />
        <DetalheColaborador selecionado={selecionado} />
      </div>
    </div>
  );
}