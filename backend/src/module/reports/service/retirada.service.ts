import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import axios from "axios";
import { createSign } from "crypto";
import { Host } from "@/common/enums/host.enum";
import { MetaService } from "@/module/reports/service/metabase.service";
import { extrairLinhasMetabase, normalizarTexto } from "@/module/reports/useCase/helper/mapearInstalacaoTecnica.helper";
import { RelatorioTecnicoDto } from "@/module/reports/dto/relatorioTecnicoInstalacao.dto";

type Registro = Record<string, unknown>;

export type RetiradaResponse = {
  data: Array<Registro & {
    id: string;
    conta: Host;
    encontrado_na_planilha: boolean;
    pago: boolean;
  }>;
  message: string;
};

const aliases = {
  os: ["cód o.s", "cod o.s", "codigo os", "código os", "numero os", "número os", "numero_ordem_servico", "ordem_servico", "os"],
  cliente: ["código cliente", "codigo cliente", "codigo_cliente", "cliente_id", "id_cliente", "cliente"],
  estado: ["estado", "uf", "state"],
  cidade: ["cidade", "municipio", "município"],
  vendedor: ["vendedor", "tecnico", "técnico", "nome vendedor", "colaborador", "responsavel", "responsável"],
};

const chave = (valor: unknown): string => String(valor ?? "").trim().toUpperCase().replace(/\\.0$/, "");
const ler = (row: Registro, nomes: string[]): string => {
  const entries = Object.entries(row);
  const normalizados = entries.map(([key, value]) => [normalizarTexto(key).toLowerCase(), value] as const);
  for (const nome of nomes) {
    const found = normalizados.find(([key]) => key === normalizarTexto(nome).toLowerCase());
    if (found && found[1] !== null && found[1] !== undefined) return String(found[1]).trim();
  }
  return "";
};

@Injectable()
export class RetiradaService {
  private readonly logger = new Logger(RetiradaService.name);

  constructor(private readonly metaService: MetaService) {}

  async buscar(dto: RelatorioTecnicoDto): Promise<RetiradaResponse> {
    if (dto.dataInicio > dto.dataFim) {
      throw new BadRequestException("A data inicial deve ser anterior ou igual à data final");
    }
    const fontes = await this.metaService.retiradas(dto);
    const entregas = await this.lerPlanilhas();
    const index = new Map<string, Registro>();
    entregas.forEach((row) => {
      const os = chave(ler(row, aliases.os));
      const cliente = chave(ler(row, aliases.cliente));
      if (os) index.set(`OS:${os}`, row);
      if (os && cliente) index.set(`OSCLIENTE:${os}:${cliente}`, row);
    });

    const data = fontes.flatMap((fonte) => extrairLinhasMetabase(fonte.rows).map((raw, indexLinha) => {
      const row = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Registro;
      const os = chave(ler(row, aliases.os));
      const cliente = chave(ler(row, aliases.cliente));
      const entrega = (os && cliente && index.get(`OSCLIENTE:${os}:${cliente}`)) || (os && index.get(`OS:${os}`));
      const estado = ler(row, aliases.estado) || ler((entrega && typeof entrega === "object" ? entrega : {}) as Registro, aliases.estado);
      const conta = fonte.host;
      return {
        ...row,
        id: `${conta}-${os || cliente || indexLinha}`,
        numero_ordem_servico: ler(row, aliases.os),
        codigo_cliente: ler(row, aliases.cliente),
        estado,
        cidade: ler(row, aliases.cidade) || ler((entrega && typeof entrega === "object" ? entrega : {}) as Registro, aliases.cidade),
        vendedor: ler(row, aliases.vendedor) || ler((entrega && typeof entrega === "object" ? entrega : {}) as Registro, aliases.vendedor),
        conta,
        encontrado_na_planilha: Boolean(entrega),
        pago: Boolean(entrega),
      };
    }));

    return {
      data,
      message: data.length ? "Retiradas entregues encontradas com sucesso" : "Nenhuma retirada do relatório foi localizada na planilha de entregas",
    };
  }

  private async lerPlanilhas(): Promise<Registro[]> {
    const sheets = [
      [process.env.GOOGLE_SHEET_ID_MAO_RET, process.env.GOOGLE_SHEET_NAME_MAO_RET],
      [process.env.GOOGLE_SHEET_ID_REGIONAIS_RET, process.env.GOOGLE_SHEET_NAME_REGIONAIS_RET],
    ].filter(([id, name]) => id && name) as [string, string][];
    if (!sheets.length) throw new InternalServerErrorException("Planilhas de retirada não configuradas");

    const token = await this.googleAccessToken();
    const rows: Registro[] = [];
    for (const [spreadsheetId, sheetName] of sheets) {
      const range = `${this.escaparNomeAba(sheetName)}!A:ZZ`;
      const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      const values = Array.isArray(response.data?.values) ? response.data.values : [];
      const headers = (values.shift() ?? []).map((header: unknown) => String(header ?? "").trim());
      values.forEach((valuesRow: unknown[]) => {
        if (valuesRow.some((value) => String(value ?? "").trim())) {
          rows.push(Object.fromEntries(headers.map((header: string, index: number) => [header, valuesRow[index] ?? ""])));
        }
      });
    }
    return rows;
  }

  private escaparNomeAba(nome: string): string {
    return `'${nome.replace(/'/g, "''")}'`;
  }

  private async googleAccessToken(): Promise<string> {
    const email = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
    if (!email || !privateKey) throw new InternalServerErrorException("Credenciais do Google Sheets não configuradas");
    const now = Math.floor(Date.now() / 1000);
    const header = this.base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = this.base64Url(JSON.stringify({ iss: email, scope: "https://www.googleapis.com/auth/spreadsheets.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${claim}`);
    const assertion = `${header}.${claim}.${this.base64Url(signer.sign(privateKey))}`;
    const response = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    return response.data.access_token as string;
  }

  private base64Url(value: string | Buffer): string {
    return Buffer.from(value).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
}
