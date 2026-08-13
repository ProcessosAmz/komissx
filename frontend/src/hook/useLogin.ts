import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { toast } from "@/hooks/use-toast";
import {
  AUTH_SESSION_QUERY_KEY,
  POST_LOGIN_ROUTE,
} from "@/const/auth";
import { AuthenticationError } from "@/errors/authenticationError";
import { AuthService } from "@/service/auth";
import { useAuth } from "@/hook/useAuth";
import { loginSchema, type LoginFormData } from "@/utils/validators/auth";

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  useEffect(() => {
    if (user) {
      navigate(POST_LOGIN_ROUTE, { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = handleSubmit(async (credentials) => {
    try {
      const authenticatedUser = await AuthService.login(credentials);
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, authenticatedUser);
      toast({
        title: `Bem-vindo, ${authenticatedUser.name}!`,
      });
      navigate(POST_LOGIN_ROUTE, { replace: true });
    } catch (error) {
      const message =
        error instanceof AuthenticationError
          ? error.message
          : "Não foi possível autenticar agora. Tente novamente.";

      toast({
        variant: "destructive",
        title: "Falha na autenticação",
        description: message,
      });
    }
  });

  return { register, errors, isSubmitting, onSubmit };
};