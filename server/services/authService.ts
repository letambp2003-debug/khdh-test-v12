export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'ADMIN';
  picture?: string;
  authenticated_at: string;
}

export class AuthService {
  private static currentUser: GoogleUser | null = null;

  public static ping(): { ok: boolean; status: string; user: GoogleUser | null } {
    if (this.currentUser) {
      return { ok: true, status: 'AUTHENTICATED', user: this.currentUser };
    }
    return { ok: false, status: 'DISCONNECTED: Chưa đăng nhập Google', user: null };
  }

  public static loginGoogle(name: string, email: string, role: 'TEACHER' | 'ADMIN' = 'TEACHER'): GoogleUser {
    this.currentUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      authenticated_at: new Date().toISOString()
    };
    return this.currentUser;
  }

  public static logout(): void {
    this.currentUser = null;
  }

  public static getCurrentUser(): GoogleUser | null {
    return this.currentUser;
  }

  public static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
