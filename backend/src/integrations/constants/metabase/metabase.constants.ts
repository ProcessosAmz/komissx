export const METABASE_INSTALLATION_FILTERS = {
  estado: {
    tag: "estado",
    type: "category",
  },

  cidade: {
    tag: "cidade",
    type: "category",
  },

  tecnico: {
    tag: "usuario_fechamento_os",
    type: "category",
  },

  dataInicio: {
    tag: "datainicio",
    type: "date/single",
  },

  dataFim: {
    tag: "datafim",
    type: "date/single",
  },
} as const;
