"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
class AuthService {
    static currentUser = null;
    static ping() {
        if (this.currentUser) {
            return { ok: true, status: 'AUTHENTICATED', user: this.currentUser };
        }
        return { ok: false, status: 'DISCONNECTED: Chưa đăng nhập Google', user: null };
    }
    static loginGoogle(name, email, role = 'TEACHER') {
        this.currentUser = {
            id: `usr_${Date.now()}`,
            name,
            email,
            role,
            authenticated_at: new Date().toISOString()
        };
        return this.currentUser;
    }
    static logout() {
        this.currentUser = null;
    }
    static getCurrentUser() {
        return this.currentUser;
    }
    static isAuthenticated() {
        return this.currentUser !== null;
    }
}
exports.AuthService = AuthService;
