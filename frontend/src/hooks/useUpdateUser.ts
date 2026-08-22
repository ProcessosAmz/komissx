import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/service/userService";
import { toast } from "@/hooks/use-toast";
import { useCreatedUserHighlight } from "@/hooks/useCreatedUserHighlight";
import type { UpdateUserFormData } from "@/utils/validators/user";

const TOAST_DURATION_IN_MS = 4000; // 4 segundos

function getUpdateUserErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return "Não foi possível atualizar o usuário.";
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setHighlight } = useCreatedUserHighlight();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserFormData;
    }) => UsersService.update(userId, payload),
    onSuccess: (response) => {
      toast({
        variant: "success",
        title: "Usuário atualizado",
        description: `${response.data.name} foi atualizado com sucesso.`,
        duration: TOAST_DURATION_IN_MS,
      });
      setHighlight(response.data.id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar usuário",
        description: getUpdateUserErrorMessage(error),
        duration: TOAST_DURATION_IN_MS,
      });
    },
  });
}
