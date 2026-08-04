export interface OpcaoFiltro {
    value: string;
    label: string;
  }
  
  export const EMPRESAS: OpcaoFiltro[] = [
    { value: "TODAS", label: "TODAS" },
    { value: "AMAZONET", label: "AMAZONET" },
    { value: "MANIA", label: "MANIA" },
  ];
  
  export const UNIDADES: OpcaoFiltro[] = [
    { value: "TODAS", label: "TODAS" },
    { value: "MANAUS", label: "MANAUS" },
    { value: "SANTAREM", label: "SANTARÉM" },
  ];
  
  export const ESTADOS: OpcaoFiltro[] = [
    { value: "TODAS", label: "TODAS" },
    { value: "AMAZONAS", label: "AMAZONAS" },
    { value: "PARA", label: "PARÁ" },
  ];