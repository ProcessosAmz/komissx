import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/service/userService";
import { toast } from "@/hooks/use-toast";

const TOAST_DURATION_IN_MS = 4000;

function getDeleteUserErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Não foi possível remover o usuário.";
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UsersService.delete(userId),
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Usuário removido",
        description: `${response.data.name} foi removido com sucesso.`,
        duration: TOAST_DURATION_IN_MS,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao remover usuário",
        description: getDeleteUserErrorMessage(error),
        duration: TOAST_DURATION_IN_MS,
      });
    },
  });
}