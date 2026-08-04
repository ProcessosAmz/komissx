import { API } from "@/lib/axios";
import type { CreateUserFormData } from "@/utils/validators/user";

export class UsersService {
  private static readonly path = "/users";

  static async create(payload: CreateUserFormData) {
    const response = await API.post(this.path, payload);
    return response.data as {
      data: { name: string; email: string };
      message: string;
    };
  }
}