import { Host } from "@/common/enums/host.enum";
import { Logger } from "@nestjs/common";

export type HubsoftConsoleFlow = "create" | "update";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const ANSI = {
  blue: "\x1b[38;5;39m",
  green: "\x1b[38;5;46m",
  red: "\x1b[38;5;196m",
  white: "\x1b[97m",
  yellow: "\x1b[33m",
} as const;

const SEPARATOR = "========================================";

const temaPorHost: Record<
  Host,
  { label: string; primary: string; secondary: string }
> = {
  [Host.MANIA]: {
    label: "MANIA",
    primary: ANSI.blue,
    secondary: ANSI.green,
  },
  [Host.AMAZONET]: {
    label: "AMAZONET",
    primary: ANSI.red,
    secondary: ANSI.white,
  },
};

const metaPorFluxo: Record<
  HubsoftConsoleFlow,
  { icon: string; title: string }
> = {
  create: { icon: "✚", title: "CREATE TICKET" },
  update: { icon: "↻", title: "UPDATE FILA" },
};

const nestLogger = new Logger("Hubsoft");

const colorir = (cor: string, texto: string): string =>
  `${cor}${texto}${RESET}`;

const colorirBold = (cor: string, texto: string): string =>
  `${BOLD}${cor}${texto}${RESET}`;

const prefixo = (host: Host, flow: HubsoftConsoleFlow): string => {
  const tema = temaPorHost[host];
  const meta = metaPorFluxo[flow];

  return (
    `${colorirBold(tema.primary, meta.icon)} ` +
    `${colorirBold(tema.primary, `[${tema.label}]`)} ` +
    `${colorir(tema.secondary, meta.title)}`
  );
};

const montarLinha = (
  host: Host,
  flow: HubsoftConsoleFlow,
  mensagem: string,
): string => `${prefixo(host, flow)} ${mensagem}`;

const montarBloco = (
  host: Host,
  flow: HubsoftConsoleFlow,
  lado: "INICIO" | "FIM",
  detalhe?: string,
): string => {
  const tema = temaPorHost[host];
  const meta = metaPorFluxo[flow];
  const titulo = detalhe
    ? `${meta.icon} ${meta.title} | ${lado} | ${detalhe}`
    : `${meta.icon} ${meta.title} | ${lado}`;

  return [
    colorir(tema.primary, SEPARATOR),
    montarLinha(host, flow, colorirBold(tema.secondary, titulo)),
    colorir(tema.primary, SEPARATOR),
  ].join("\n");
};

export const hubsoftConsole = {
  start(host: Host, flow: HubsoftConsoleFlow, detalhe?: string): void {
    nestLogger.log(montarBloco(host, flow, "INICIO", detalhe));
  },

  end(host: Host, flow: HubsoftConsoleFlow, detalhe?: string): void {
    nestLogger.log(montarBloco(host, flow, "FIM", detalhe));
  },

  info(host: Host, flow: HubsoftConsoleFlow, mensagem: string): void {
    nestLogger.log(montarLinha(host, flow, mensagem));
  },

  success(host: Host, flow: HubsoftConsoleFlow, mensagem: string): void {
    const tema = temaPorHost[host];
    nestLogger.log(
      montarLinha(
        host,
        flow,
        colorir(tema.secondary, `✓ ${mensagem}`),
      ),
    );
  },

  warn(host: Host, flow: HubsoftConsoleFlow, mensagem: string): void {
    nestLogger.warn(
      montarLinha(host, flow, colorir(ANSI.yellow, `⚠ ${mensagem}`)),
    );
  },

  error(host: Host, flow: HubsoftConsoleFlow, mensagem: string): void {
    const tema = temaPorHost[host];
    nestLogger.error(
      montarLinha(host, flow, colorir(tema.primary, `✗ ${mensagem}`)),
    );
  },

  skip(host: Host, flow: HubsoftConsoleFlow, mensagem: string): void {
    nestLogger.log(
      montarLinha(host, flow, colorir(DIM, `○ ${mensagem}`)),
    );
  },
};
