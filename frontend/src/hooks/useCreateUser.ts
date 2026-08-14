import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/service/userService";
import type { CreateUserFormData } from "@/utils/validators/user";

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUserFormData) => UsersService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}