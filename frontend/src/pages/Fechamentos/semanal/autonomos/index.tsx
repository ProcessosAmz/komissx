import FechamentoTecnico from "@/pages/Fechamentos/semanal/tecnicos";

export default function FechamentoAutonomos() {
  // Usa a mesma consulta Metabase do fechamento técnico; o cargo restringe
  // os vendedores pelos marcadores AUTO/AUTONOMO e aplica a regra semanal.
  return <FechamentoTecnico cargo="AUTONOMO" origem="VENDAS" />;
}
