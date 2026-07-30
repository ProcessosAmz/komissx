import { API } from "@/lib/axios";



// TODO: TYPES FOR THE RESPONSES

export class AuthService {
    static readonly path = '/auth'

    static async login(email: string, password: string) {
        const response = await API.post(`${this.path}/login`, { email, password });
        return response.data;
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