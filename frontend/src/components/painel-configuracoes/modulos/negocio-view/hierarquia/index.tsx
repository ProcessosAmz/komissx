import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Link2Off,
  Plus,
  Trash2,
  Unlink,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Filtro } from "./filtro";

type Cargo = "SUPERVISOR" | "LIDER" | "TECNICO" | "AUTONOMO";

type HierarquiaNode = {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  operadora: string;
  regional: string;
  idHubsoft: string;
  participaFechamento: boolean;
  children?: HierarquiaNode[];
};

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

function getIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

function cargoBadgeClass(cargo: Cargo) {
  if (cargo === "SUPERVISOR") {
    return "bg-indigo-600/20 text-indigo-300 border-indigo-500/30";
  }
  if (cargo === "LIDER") {
    return "bg-slate-700/60 text-slate-300 border-slate-600/50";
  }
  return "bg-transparent text-slate-500 border-slate-700/40";
}

function contarNos(nos: HierarquiaNode[]): number {
  return nos.reduce(
    (total, no) => total + 1 + contarNos(no.children ?? []),
    0,
  );
}

function encontrarNo(
  nos: HierarquiaNode[],
  id: string,
): HierarquiaNode | null {
  for (const no of nos) {
    if (no.id === id) return no;
    const filho = encontrarNo(no.children ?? [], id);
    if (filho) return filho;
  }
  return null;
}

function TreeNodeItem({
  no,
  profundidade,
  selecionadoId,
  abertos,
  onToggle,
  onSelect,
}: {
  no: HierarquiaNode;
  profundidade: number;
  selecionadoId: string;
  abertos: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const temFilhos = (no.children?.length ?? 0) > 0;
  const aberto = abertos[no.id] ?? profundidade < 2;
  const selecionado = selecionadoId === no.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(no.id)}
        className={`w-full flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors ${
          selecionado
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-800 bg-[#05080f] hover:border-slate-700"
        }`}
        style={{ marginLeft: profundidade * 16 }}
      >
        <span
          className="shrink-0 w-4 h-4 flex items-center justify-center text-slate-500"
          onClick={(evento) => {
            if (!temFilhos) return;
            evento.stopPropagation();
            onToggle(no.id);
          }}
        >
          {temFilhos ? (
            aberto ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : null}
        </span>

        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-indigo-600/20 text-indigo-300 text-[10px] font-bold">
            {getIniciais(no.nome)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-100 truncate">
            {no.nome}
          </p>
          <p className="text-[10px] text-slate-500 truncate">{no.email}</p>
        </div>

        <Badge
          variant="outline"
          className={`text-[9px] font-bold tracking-wide shrink-0 ${cargoBadgeClass(no.cargo)}`}
        >
          {no.cargo}
        </Badge>
      </button>

      {temFilhos && aberto ? (
        <div className="mt-1.5 space-y-1.5">
          {no.children!.map((filho) => (
            <TreeNodeItem
              key={filho.id}
              no={filho}
              profundidade={profundidade + 1}
              selecionadoId={selecionadoId}
              abertos={abertos}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

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

  const lideresVinculados =
    selecionado?.cargo === "SUPERVISOR"
      ? (selecionado.children ?? []).filter((filho) => filho.cargo === "LIDER")
      : [];

  const onToggle = (id: string) => {
    setAbertos((atual) => ({ ...atual, [id]: !(atual[id] ?? false) }));
  };

  return (
    <div className="space-y-6 text-slate-200 antialiased font-sans">
      <Filtro />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-5 bg-[#090d16] border-slate-800 rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                Árvore Hierárquica
              </h3>
              <span className="text-[11px] text-slate-500">
                {totalRegistros} registros
              </span>
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {MOCK_TREE.map((no) => (
                <TreeNodeItem
                  key={no.id}
                  no={no}
                  profundidade={0}
                  selecionadoId={selecionadoId}
                  abertos={abertos}
                  onToggle={onToggle}
                  onSelect={setSelecionadoId}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7 bg-[#090d16] border-slate-800 rounded-2xl">
          <CardContent className="p-4 space-y-5">
            {!selecionado ? (
              <p className="text-sm text-slate-500">
                Selecione um colaborador na árvore.
              </p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-indigo-600/20 text-indigo-300 text-xs font-bold">
                        {getIniciais(selecionado.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-100 truncate">
                          {selecionado.nome}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold ${cargoBadgeClass(selecionado.cargo)}`}
                        >
                          {selecionado.cargo}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {selecionado.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Nome
                    </label>
                    <Input
                      defaultValue={selecionado.nome}
                      key={`${selecionado.id}-nome`}
                      className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Email
                    </label>
                    <Input
                      defaultValue={selecionado.email}
                      key={`${selecionado.id}-email`}
                      className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Cargo
                    </label>
                    <Input
                      defaultValue={selecionado.cargo}
                      disabled
                      key={`${selecionado.id}-cargo`}
                      className="h-9 rounded-xl border-slate-800 bg-[#03050a] text-xs opacity-70"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Operadora
                    </label>
                    <select
                      key={`${selecionado.id}-operadora`}
                      defaultValue={selecionado.operadora}
                      className="w-full h-9 rounded-xl border border-slate-800 bg-[#05080f] px-3 text-xs text-slate-300 font-semibold"
                    >
                      <option value="AMAZONET">AMAZONET</option>
                      <option value="MANIA">MANIA</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Regional
                    </label>
                    <Input
                      defaultValue={selecionado.regional}
                      key={`${selecionado.id}-regional`}
                      className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      ID Hubsoft
                    </label>
                    <Input
                      defaultValue={selecionado.idHubsoft}
                      key={`${selecionado.id}-hubsoft`}
                      className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#05080f] px-3 py-2.5">
                  <span className="text-xs text-slate-300">
                    Participa fechamento mensal
                  </span>
                  <button
                    type="button"
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      selecionado.participaFechamento
                        ? "bg-indigo-500"
                        : "bg-slate-700"
                    }`}
                    aria-label="Participa fechamento mensal"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        selecionado.participaFechamento
                          ? "left-4"
                          : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {selecionado.cargo === "SUPERVISOR" ? (
                  <div className="space-y-3 pt-1">
                    <h5 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Vincular líderes existentes
                    </h5>

                    <Input
                      placeholder="Buscar líder para vincular..."
                      className="h-9 rounded-xl border-slate-800 bg-[#05080f] text-xs"
                    />

                    <div className="space-y-2">
                      {lideresVinculados.map((lider) => (
                        <div
                          key={lider.id}
                          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#05080f] px-2.5 py-2"
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-slate-700/50 text-slate-300 text-[10px] font-bold">
                              {getIniciais(lider.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-100 truncate">
                              {lider.nome}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {lider.email}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold ${cargoBadgeClass("LIDER")}`}
                          >
                            LIDER
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-500 hover:text-red-400"
                          >
                            <Unlink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar novo líder neste supervisor
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}