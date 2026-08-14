import { useQuery } from "@tanstack/react-query";
import { EmpresasService } from "@/service/empresasService";

export function useEmpresas() {
  return useQuery({
    queryKey: ["empresas"],
    queryFn: () => EmpresasService.findAll(),
  });
}