import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Host } from "@/common/enums/host.enum";
import { MetaService } from "@/module/reports/service/metabase.service";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";
import { extrairLinhasMetabase, normalizarTexto } from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";

type Registro = Record<string, unknown>;
export type VendaAutonomo = Registro & {
  id: string; numero_ordem_servico: string; codigo_cliente: string; vendedor: string;
  status: string; financeiro: "PAGO" | "-"; valor: number; cidade: string; estado: string;
  conta: Host; usuario_cadastro: string; data_termino_executado: string;
};
const aliases = {
  os: ["numero_ordem_servico", "numero_os", "ordem_servico", "os"],
  cliente: ["codigo_cliente", "cliente_id", "id_cliente"],
  vendedor: ["vendedor", "usuario_fechamento_os", "usuario_fechamento", "tecnico"],
  motivo: ["motivo_comercial", "motivo_fechamento", "motivo"],
  auditoria: ["status_auditoria", "status_comercial", "status"],
  cidade: ["cidade", "municipio", "município"], estado: ["estado", "uf"],
  usuario: ["usuario_cadastro", "usuario_abertura_os", "usuario_abertura"],
  data: ["data_termino_executado", "data_fechamento", "data"],
};
const ler = (row: Registro, names: string[]) => {
  const entries = Object.entries(row).map(([key, value]) => [normalizarTexto(key).toLowerCase(), value] as const);
  for (const name of names) { const found = entries.find(([key]) => key === normalizarTexto(name).toLowerCase()); if (found?.[1] != null) return String(found[1]).trim(); }
  return "";
};
const upper = (value: string) => value.trim().toUpperCase();
const cidadeEstado = (vendedor: string) => {
  const cidades: Record<string, [string, string]> = { MAO: ["Manaus", "AM"], PFG: ["Presidente Figueiredo", "AM"], MPU: ["Manacapuru", "AM"], RPE: ["Rio Preto da Eva", "AM"], IRA: ["Iranduba", "AM"], PIN: ["Parintins", "AM"], ITA: ["Itacoatiara", "AM"], STM: ["Santarém", "PA"], ALQ: ["Alenquer", "PA"], MAB: ["Marabá", "PA"], PRN: ["Prainha", "PA"], MTA: ["Monte Alegre", "PA"], OBI: ["Óbidos", "PA"], ORX: ["Oriximiná", "PA"], BEL: ["Belterra", "PA"], MDC: ["Mojuí dos Campos", "PA"], ITB: ["Itaituba", "PA"], CUR: ["Curuá", "PA"], URA: ["Uruará", "PA"], ADC: ["Alter do Chão", "PA"] };
  const key = upper(vendedor).match(/(?:AUTO|AUTONOMO|TEC)[_ -]*([A-Z]{2,4})\b/)?.[1] ?? "";
  return cidades[key] ?? ["-", "-"];
};
const status = (motivo: string, auditoria: string) => {
  const m = upper(motivo), a = upper(auditoria);
  if (/DESIST[ÊE]NCIA|INVIABILIDADE/.test(m) || a === "REPROVADO" || m === "REPROVADO TOTAL") return "REPROVADO";
  if (m === "AUDITORIA - VENDA APROVADA" || m === "REANÁLISE - VENDA APROVADA" || a === "APROVADO") return "APROVADO";
  if (["QUALIDADE - NÃO CONFORMIDADE", "QUALIDADE - REANÁLISE", "N.C APROVADO", "NC APROVADO"].includes(a)) return "N.C APROVADO";
  return "-";
};

@Injectable()
export class VendasAutonomosService {
  constructor(private readonly metaService: MetaService) {}
  async buscar(dto: RelatorioTecnicoDto): Promise<{ data: VendaAutonomo[]; message: string }> {
    if (dto.dataInicio > dto.dataFim) {
      throw new BadRequestException("A data inicial deve ser anterior ou igual à data final");
    }
    const fontes = await this.metaService.vendasAutonomos(dto);
    const data = fontes.flatMap((fonte) => extrairLinhasMetabase(fonte.rows).flatMap((raw, index) => {
      const row = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Registro;
      const vendedor = ler(row, aliases.vendedor);
      if (!/\bAUTO(?:NOMO)?\b/i.test(vendedor)) return [];
      const [cidade, estado] = cidadeEstado(vendedor);
      const finalStatus = status(ler(row, aliases.motivo), ler(row, aliases.auditoria));
      return [{ ...row, id: `${fonte.host}-${ler(row, aliases.os)}-${index}`, numero_ordem_servico: ler(row, aliases.os), codigo_cliente: ler(row, aliases.cliente), vendedor, status: finalStatus, financeiro: ["APROVADO", "N.C APROVADO"].includes(finalStatus) ? "PAGO" as const : "-" as const, valor: ["APROVADO", "N.C APROVADO"].includes(finalStatus) ? 50 : 0, cidade: ler(row, aliases.cidade) || cidade, estado: ler(row, aliases.estado) || estado, conta: fonte.host, usuario_cadastro: ler(row, aliases.usuario), data_termino_executado: ler(row, aliases.data) }];
    }));
    return { data, message: data.length ? "Vendas de autônomos encontradas" : "Nenhuma venda de autônomo encontrada" };
  }
}
