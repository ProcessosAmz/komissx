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
