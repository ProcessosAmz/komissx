import { useOutletContext } from "react-router-dom";
import regrasBase from "@/data/rules.json";
import { ModuloMensal } from "@/features/configuracoes/components/ModuloMensal";

type ContextoConfiguracao = {
  globalRules?: unknown;
  onSalvar: (valor: unknown) => void;
};

export default function ConfiguracaoMensalPage() {
  const contexto = useOutletContext<ContextoConfiguracao>();
  const configuracao = contexto.globalRules ?? regrasBase;

  return (
    <ModuloMensal
      jsonOriginal={configuracao}
      onSalvar={contexto.onSalvar}
    />
  );
}
