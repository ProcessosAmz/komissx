import { useQuery } from "@tanstack/react-query";
import { EstadosService } from "@/service/estadosService";

export function useEstados() {
  return useQuery({
    queryKey: ["estados"],
    queryFn: () => EstadosService.findAll(),
  });
}