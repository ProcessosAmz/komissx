import { Host } from "@/common/enums/host.enum";
import { RelatorioVendasLider } from "@/module/reports/dto/vendasLiderComercial.dto";
import { montarParametrosVendasComercial } from "@/module/reports/service/metabase.service";

describe("montarParametrosVendasComercial", () => {
  const filtros: RelatorioVendasLider = {
    dataInicio: "2026-09-21",
    dataFim: "2026-10-20",
  };

  it("preserva a data final inclusiva do fechamento comercial", () => {
    expect(montarParametrosVendasComercial(filtros, Host.AMAZONET)).toEqual([
      {
        type: "date/single",
        value: "2026-09-21",
        target: ["variable", ["template-tag", "datainicio"]],
      },
      {
        type: "date/single",
        value: "2026-10-20",
        target: ["variable", ["template-tag", "datafim"]],
      },
    ]);
  });

  it("preserva os parÃ¢metros da Mania sem compartilhar o ajuste tÃ©cnico", () => {
    expect(
      montarParametrosVendasComercial(
        { ...filtros, empresa: Host.MANIA },
        Host.MANIA,
      ).find((parametro) => parametro.target[1][1] === "datafim")?.value,
    ).toBe("2026-10-20");
  });
});
