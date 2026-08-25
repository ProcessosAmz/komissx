import { API } from "@/lib/axios";
import type { CreateUserFormData, UpdateUserFormData } from "@/utils/validators/user";
import type { FiltroUsuarios, UserApiNode } from "@/types/filtro";

export class UsersService {
  private static readonly path = "/users";

  static async create(payload: CreateUserFormData) {
    const response = await API.post(this.path, payload);
    return response.data as {
      data: { id: string; name: string; email: string };
      message: string;
    };
  }

  static async update(userId: string, payload: UpdateUserFormData) {
    const response = await API.patch(`${this.path}/${userId}`, payload);
    return response.data as {
      data: { id: string; name: string; email: string };
      message: string;
    };
  }

  static async findAll(filters?: FiltroUsuarios) {
    const response = await API.get(this.path, { params: filters });
    return response.data as {
      data: UserApiNode[];
      message: string;
    };
  }

  static async delete(userId: string) {
    const response = await API.delete(`${this.path}/${userId}`);
    return response.data as {
      data: { id: string; name: string; email: string };
      message: string;
    };
  }
}