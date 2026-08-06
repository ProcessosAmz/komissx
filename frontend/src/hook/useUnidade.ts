import { useQuery } from "@tanstack/react-query";
import { UnidadesService } from "@/service/unidadeService";

type Filters = {
  empresaId?: string;
  estadoId?: string;
};

export function useUnidades(filters: Filters = {}) {
  return useQuery({
    queryKey: ["unidades", filters],
    queryFn: () => UnidadesService.findAll(filters),
  });
}