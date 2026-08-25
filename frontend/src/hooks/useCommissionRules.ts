import { useQuery } from "@tanstack/react-query";
import {
  CommissionRulesService,
  mapRulesToSemanal,
} from "@/service/commissionRulesService";

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: () => CommissionRulesService.findAll(),
    select: (response) => mapRulesToSemanal(response.data),
  });
}