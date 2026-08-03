export interface OpcaoFiltro {
    value: string;
    label: string;
  }
  
  export const EMPRESAS: OpcaoFiltro[] = [
    { value: "AMAZONET", label: "AMAZONET" },
    { value: "MANIA", label: "MANIA" },
  ];
  
  export const UNIDADES: OpcaoFiltro[] = [
    { value: "MANAUS", label: "MANAUS" },
    { value: "SANTAREM", label: "SANTARÉM" },
  ];
  
  export const ESTADOS: OpcaoFiltro[] = [
    { value: "AMAZONAS", label: "AMAZONAS" },
    { value: "PARA", label: "PARÁ" },
  ];