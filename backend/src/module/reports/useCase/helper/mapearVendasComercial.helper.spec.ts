import { Host } from "@/common/enums/host.enum";
import {
  coletarDescendentes,
  encontrarColaboradorDaVenda,
  filtrarVendasDaEquipe,
  isCargoComercial,
  isLiderRole,
  isSupervisorRole,
  limparNomeVendedor,
  mapearLinhaVendaComercial,
  resolverEquipeComercial,
  UsuarioHierarquiaComercial,
} from "@/module/reports/useCase/helper/mapearVendasComercial.helper";

const SUPERVISOR_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const LIDER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const MARIA_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
const JOSE_ID = "1b4e28ba-2fa1-11d2-883f-0016d38d04c0";
const RAYANE_ID = "c56a4180-65aa-42ec-a945-5fd21dec0538";

const makeUsuario = (
  overrides: Partial<UsuarioHierarquiaComercial>,
): UsuarioHierarquiaComercial => ({
  id: MARIA_ID,
  name: "Maria Silva",
  roleName: "INTERNO",
  supervisorId: LIDER_ID,
  supervisorName: "Camila Modesto",
  unidadeName: "Manaus",
  empresaName: "Amazonet",
  ...overrides,
});

const equipe = (): UsuarioHierarquiaComercial[] => [
  makeUsuario({
    id: SUPERVISOR_ID,
    name: "Jessica Martins",
    roleName: "SUPERVISOR",
    supervisorId: null,
    unidadeName: "Amazonas",
  }),
  makeUsuario({
    id: LIDER_ID,
    name: "Camila Modesto",
    roleName: "LIDER",
    supervisorId: SUPERVISOR_ID,
  }),
  makeUsuario({
    id: MARIA_ID,
    name: "Beatriz Nobre Dos Anjos",
    roleName: "INTERNO",
    supervisorId: LIDER_ID,
  }),
  makeUsuario({
    id: JOSE_ID,
    name: "Danilo Conrado de Oliveira",
    roleName: "INTERNO",
    supervisorId: LIDER_ID,
  }),
  makeUsuario({
    id: RAYANE_ID,
    name: "Rayane Neves Lira",
    roleName: "REGIONAL INTERNO",
    supervisorId: SUPERVISOR_ID,
    unidadeName: "Amazonas",
  }),
  makeUsuario({
    id: "tecnico-id",
    name: "Tecnico Exemplo",
    roleName: "TECNICO",
    supervisorId: LIDER_ID,
  }),
];

describe("mapearVendasComercial.helper", () => {
  it("limpa o sufixo Hubsoft do vendedor", () => {
    expect(
      limparNomeVendedor("Danilo Conrado de Oliveira_CMRC_MAO"),
    ).toBe("Danilo Conrado de Oliveira");
  });

  it("reconhece cargos de liderança", () => {
    expect(isLiderRole("LIDER")).toBe(true);
    expect(isLiderRole("SUPERVISOR")).toBe(false);
    expect(isSupervisorRole("SUPERVISOR COMERCIAL")).toBe(true);
    expect(isCargoComercial("TECNICO")).toBe(false);
    expect(isCargoComercial("INTERNO")).toBe(true);
  });

  it("mapeia a linha do Metabase para o DTO", () => {
    const venda = mapearLinhaVendaComercial(
      {
        tipo_ordem_servico: "INSTALAÇÃO GRÁTIS",
        numero_ordem_servico: "003226292113004955",
        id_atendimento: 3101861,
        codigo_cliente: "180208",
        nome_razaosocial: "MILENE DE SOUZA DOS SANTOS",
        data_termino_executado: "2026-10-19T16:03:09",
        id_cliente: 185664,
        nome_servico: "AMAZONAS 600 Mbps | START (FIDELIDADE)",
        vendedor: "Danilo Conrado de Oliveira_CMRC_MAO",
        status_atendimento: "Aguardando Análise",
        data_cadastro: "2026-10-19T11:30:17",
        valor_servico: 110.0,
        usuario_cadastro: "Danilo Conrado de Oliveira_CMRC_MAO",
        status_auditoria: "AGUARDANDO ANÁLISE",
        motivo_fechamento: null,
      },
      0,
      "https://amazonet.hubsoft.com.br:8443/api/public/card/c062be07-d95b-436c-b2fd-f2a55ba8c8ca/query/json",
      Host.AMAZONET,
    );

    expect(venda.vendedor_limpo).toBe("Danilo Conrado de Oliveira");
    expect(venda.nome_cliente).toBe("MILENE DE SOUZA DOS SANTOS");
    expect(venda.valor_servico).toBe(110);
    expect(venda.conta).toBe(Host.AMAZONET);
    expect(venda.colaborador_id).toBeNull();
  });

  it("expande o líder só para os filhos e o supervisor para a subárvore", () => {
    const usuarios = equipe();
    const doLider = resolverEquipeComercial(usuarios, LIDER_ID);
    const daSupervisora = resolverEquipeComercial(usuarios, SUPERVISOR_ID);

    expect(doLider.equipe.map((usuario) => usuario.id)).toEqual([
      MARIA_ID,
      JOSE_ID,
    ]);
    expect(coletarDescendentes(usuarios, SUPERVISOR_ID).map((usuario) => usuario.id)).toEqual(
      expect.arrayContaining([LIDER_ID, MARIA_ID, JOSE_ID, RAYANE_ID]),
    );
    expect(daSupervisora.paraMatch.map((usuario) => usuario.id)).toEqual(
      expect.arrayContaining([SUPERVISOR_ID, LIDER_ID, MARIA_ID, RAYANE_ID]),
    );
    expect(daSupervisora.paraMatch.some((usuario) => usuario.roleName === "TECNICO")).toBe(
      false,
    );
  });

  it("marca venda do líder e vincula a equipe pelo nome limpo", () => {
    const usuarios = equipe();
    const { paraMatch } = resolverEquipeComercial(usuarios, LIDER_ID);
    const vendas = [
      mapearLinhaVendaComercial(
        {
          numero_ordem_servico: "0032-1",
          codigo_cliente: "1",
          vendedor: "Alguem De Fora_CMRC_MAO",
          usuario_cadastro: "Danilo Conrado de Oliveira_CMRC_MAO",
          valor_servico: 110,
        },
        0,
        "amazonet",
        Host.AMAZONET,
      ),
      mapearLinhaVendaComercial(
        {
          numero_ordem_servico: "0032-2",
          codigo_cliente: "2",
          vendedor: "Camila Modesto_CMRC_MAO",
          usuario_cadastro: "Camila Modesto_CMRC_MAO",
          valor_servico: 110,
        },
        1,
        "amazonet",
        Host.AMAZONET,
      ),
      mapearLinhaVendaComercial(
        {
          numero_ordem_servico: "0032-3",
          codigo_cliente: "3",
          vendedor: "Alguem De Fora_CMRC_MAO",
          usuario_cadastro: "Alguem De Fora_CMRC_MAO",
          valor_servico: 110,
        },
        2,
        "amazonet",
        Host.AMAZONET,
      ),
    ];

    const filtradas = filtrarVendasDaEquipe(vendas, paraMatch, LIDER_ID);
    const doLider = filtradas.find((venda) => venda.venda_do_lider);
    const daEquipe = filtradas.find((venda) => venda.colaborador_id === JOSE_ID);

    expect(filtradas).toHaveLength(2);
    expect(doLider?.colaborador_id).toBe(LIDER_ID);
    expect(daEquipe?.venda_do_lider).toBe(false);
    expect(
      encontrarColaboradorDaVenda(vendas[2], paraMatch),
    ).toBeUndefined();
  });
});
