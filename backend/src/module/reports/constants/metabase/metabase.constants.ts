export const METABASE_INSTALLATION_FILTERS = {
  estado: {
    tag: "estado",
    type: "string/=",
    target: "dimension",
  },
  cidade: {
    tag: "cidade",
    type: "string/=",
    target: "dimension",
  },
  tecnico: {
    tag: "usuario_fechamento_os",
    type: "string/=",
    target: "dimension",
  },
  dataInicio: {
    tag: "datainicio",
    type: "date/single",
    target: "variable",
  },
  dataFim: {
    tag: "datafim",
    type: "date/single",
    target: "variable",
  },
} as const;

export const METABASE_INSTALLATION_FILTERS_MANIA = {
  estado: {
    id: "7ec1444e-11b8-3a67-f2f7-cf25c5e24884",
    tag: "estado",
    type: "category",
    target: "variable",
  },
  cidade: {
    id: "fa4d23b3-bf30-c495-6df3-8ca5cb2e1e79",
    tag: "cidade",
    type: "category",
    target: "variable",
  },
  dataInicio: {
    id: "c372ffdd-615b-4a9b-ac6b-1df7937d408d",
    tag: "datainicio",
    type: "date/single",
    target: "variable",
  },
  dataFim: {
    id: "9cd7b2dd-a0d0-fded-5c07-e112bb83de1c",
    tag: "datafim",
    type: "date/single",
    target: "variable",
  },
} as const;
