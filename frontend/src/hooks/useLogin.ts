import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "@/hooks/use-toast";
import {
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_QUERY_KEY,
  POST_LOGIN_ROUTE,
} from "@/const/auth";
import { AuthenticationError } from "@/errors/authenticationError";
import { AuthService } from "@/service/auth";
import { loginSchema, type LoginFormData } from "@/utils/validators/auth";

const TOAST_DURATION_IN_MS = 4000;

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (credentials) => {
    try {
      const authenticatedUser = await AuthService.login(credentials);
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, authenticatedUser);

      toast({
        variant: "success",
        title: `Bem-vindo, ${authenticatedUser.name}!`,
        description: "Login realizado com sucesso.",
        duration: TOAST_DURATION_IN_MS,
      });

      navigate(POST_LOGIN_ROUTE, { replace: true });
    } catch (error) {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : AUTH_ERROR_MESSAGES.UNEXPECTED;

      toast({
        variant: "destructive",
        title: "Falha na autenticação",
        description: message,
        duration: TOAST_DURATION_IN_MS,
      });
    }
  });

  return { register, errors, isSubmitting, onSubmit };
};