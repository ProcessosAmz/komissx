import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthService } from "@/service/auth";
import type { LoginPayload } from "@/types/auth";
import { useAuth } from "@/stores/auth.store";

export function useLogin() {
  const setUser = useAuth((state) => state.login);

  return useMutation({
    mutationFn: (payload: LoginPayload) => AuthService.login(payload),
    onSuccess: (response) => {
      setUser(response.data);
      toast.success(response.message ?? `Bem-vindo, ${response.data.name}!`);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível autenticar agora. Tente novamente.";

      toast.error(message);
    },
  });
}