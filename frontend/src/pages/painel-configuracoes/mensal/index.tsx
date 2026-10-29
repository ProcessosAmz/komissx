import { useOutletContext } from "react-router-dom";
import { ModuloMensal } from "@/features/configuracoes/components/ModuloMensal";
import { atualizarConfiguracaoMensal, obterConfiguracaoMensal } from "@/config/configuracaoMensal";

type ContextoConfiguracao = {
  globalRules?: unknown;
  onSalvar: (valor: unknown) => void;
};

export default function ConfiguracaoMensalPage() {
  const contexto = useOutletContext<ContextoConfiguracao>();
  const configuracao = contexto.globalRules ?? obterConfiguracaoMensal();

  return (
    <ModuloMensal
      jsonOriginal={configuracao}
      onSalvar={(valor) => {
        const configuracaoAtualizada = (valor && typeof valor === "object" && "fechamento_mensal" in valor)
          ? valor
          : { ...configuracao, fechamento_mensal: valor };
        atualizarConfiguracaoMensal(configuracaoAtualizada);
        contexto.onSalvar(configuracaoAtualizada);
      }}
    />
  );
}
