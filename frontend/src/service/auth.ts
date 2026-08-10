import { API } from "@/lib/axios";
import { LoginPayload, LoginResponse } from "@/types/auth";

export class AuthService {
    static readonly path = "/auth";

    static async login(payload: LoginPayload): Promise<LoginResponse> {
        const response = await API.post(`${this.path}/login`, payload);
        return response.data as LoginResponse;

    }

    static async logout() {
        const response = await API.post(`${this.path}/logout`);
        return response.data;
    }

    static async me() {
        const response = await API.get(`${this.path}/user`);
        return response.data;
    }
}