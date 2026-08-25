import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { ConfigService } from "@/config/ConfigService";
import {
  CommissionRulesService,
  type CommissionRuleApi,
} from "@/service/commissionRulesService";

const QUERY_KEY = ["commission-rules"];

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Não foi possível atualizar a comissão.";
}

export function useCommissionRules() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => CommissionRulesService.findAll(),
    select: (response) => response.data,
  });
}

export function useMutateCommissionRules() {
  const queryClient = useQueryClient();

  const onSuccess = (message: string) => {
    ConfigService.getInstance().clearCache();
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    toast({ variant: "success", title: "Comissão", description: message });
  };

  const onError = (error: unknown) => {
    toast({
      variant: "destructive",
      title: "Falha",
      description: getErrorMessage(error),
    });
  };

  const create = useMutation({
    mutationFn: (payload: {
      nome: string;
      evento: CommissionRuleApi["evento"];
      valor: number;
    }) => CommissionRulesService.create(payload),
    onSuccess: (response) => onSuccess(response.message),
    onError,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { nome?: string; valor?: number };
    }) => CommissionRulesService.update(id, payload),
    onSuccess: (response) => onSuccess(response.message),
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: number) => CommissionRulesService.remove(id),
    onSuccess: (response) => onSuccess(response.message),
    onError,
  });

  return { create, update, remove };
}