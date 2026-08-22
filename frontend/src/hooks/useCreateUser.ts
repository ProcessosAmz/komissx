import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/service/userService";
import { toast } from "@/hooks/use-toast";
import { useCreatedUserHighlight } from "@/hooks/useCreatedUserHighlight";
import type { CreateUserFormData } from "@/utils/validators/user";

const TOAST_DURATION_IN_MS = 4000;

function getCreateUserErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Não foi possível criar o usuário.";
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { setHighlight } = useCreatedUserHighlight();

  return useMutation({
    mutationFn: (payload: CreateUserFormData) => UsersService.create(payload),
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Usuário criado",
        description: `${response.data.name} foi adicionado à hierarquia.`,
        duration: TOAST_DURATION_IN_MS,
      });
      setHighlight(response.data.id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao criar usuário",
        description: getCreateUserErrorMessage(error),
        duration: TOAST_DURATION_IN_MS,
      });
    },
  });
}
