import { Host } from "@/common/enums/host.enum";

export type HubsoftConfig = {
  url: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  grantType: string;
  botToken: string;
  metabaseInstalacaoTecnico: string;
};

export const getHubsoftConfig = (host: Host): HubsoftConfig => {
  const configs: Record<Host, HubsoftConfig> = {
    [Host.AMAZONET]: {
      url: process.env.AMAZONET_HUB_URL ?? "",
      clientId: process.env.AMAZONET_HUB_CLIENT_ID ?? "",
      clientSecret: process.env.AMAZONET_HUB_CLIENT_SECRET ?? "",
      username: process.env.AMAZONET_HUB_USERNAME ?? "",
      password: process.env.AMAZONET_HUB_PASSWORD ?? "",
      grantType: process.env.AMAZONET_HUB_GRANT_TYPE ?? "",
      botToken: process.env.AMAZONET_BOT_TOKEN ?? "",
      metabaseInstalacaoTecnico:
        process.env.AMAZONET_METABASE_INSTALACAO_TECNICO ?? "",
    },
    [Host.MANIA]: {
      url: process.env.MANIA_HUB_URL ?? "",
      clientId: process.env.MANIA_HUB_CLIENT_ID ?? "",
      clientSecret: process.env.MANIA_HUB_CLIENT_SECRET ?? "",
      username: process.env.MANIA_HUB_USERNAME ?? "",
      password: process.env.MANIA_HUB_PASSWORD ?? "",
      grantType: process.env.MANIA_HUB_GRANT_TYPE ?? "",
      botToken: process.env.MANIA_BOT_TOKEN ?? "",
      metabaseInstalacaoTecnico:
        process.env.MANIA_METABASE_INSTALACAO_TECNICO ?? "",
    },
  };

  return configs[host];
};
