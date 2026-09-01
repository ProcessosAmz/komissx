import type { FormularioNovaOs } from "@/types/tecnicos";

export const formularioInicial = (params: {
  tecnicoId: string;
  dataTermino: string;
}): FormularioNovaOs => ({
  codigoCliente: "",
  nomeCliente: "",
  numeroOs: "",
  tecnicoId: params.tecnicoId,
  statusAuditoria: "APROVADO",
  cidade: "",
  estado: "",
  dataTermino: params.dataTermino,
});
