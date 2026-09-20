export type AuthProvider = 'google' | 'email_password';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'ADMIN';
  picture?: string;
  authenticated_at: string;
  auth_provider: AuthProvider;
  email_verified: boolean;
  school?: string;
  subject?: string;
  password?: string;
}

export type GoogleUser = UserAccount;

interface PendingOtp {
  code: string;
  expiresAt: number;
  name: string;
  password?: string;
  school?: string;
  subject?: string;
}

export class AuthService {
  private static currentUser: UserAccount | null = null;
  private static users: Map<string, UserAccount> = new Map();
  private static otpStore: Map<string, PendingOtp> = new Map();

  static {
    // Khởi tạo sẵn tài khoản mẫu chuẩn sư phạm
    const presetTeachers: UserAccount[] = [
      {
        id: 'usr_nam_01',
        name: 'Trần Văn Nam',
        email: 'nguyenvannam.toan8@edu.vn',
        role: 'TEACHER',
        auth_provider: 'google',
        email_verified: true,
        school: 'TRƯỜNG THCS QUANG TRUNG',
        subject: 'Toán',
        authenticated_at: new Date().toISOString()
      },
      {
        id: 'usr_mai_02',
        name: 'Nguyễn Thị Mai',
        email: 'tranthimai.khtn7@edu.vn',
        role: 'TEACHER',
        auth_provider: 'google',
        email_verified: true,
        school: 'TRƯỜNG THCS NGUYỄN DU',
        subject: 'Khoa học tự nhiên',
        authenticated_at: new Date().toISOString()
      },
      {
        id: 'usr_letam_03',
        name: 'Lê Tâm',
        email: 'letam.teacher@gmail.com',
        role: 'TEACHER',
        auth_provider: 'email_password',
        password: 'password123',
        email_verified: true,
        school: 'TRƯỜNG THCS QUANG TRUNG',
        subject: 'Toán - Tin học',
        authenticated_at: new Date().toISOString()
      }
    ];

    for (const t of presetTeachers) {
      this.users.set(t.email.toLowerCase(), t);
    }
  }

  public static ping(): { ok: boolean; status: string; user: UserAccount | null } {
    if (this.currentUser) {
      return { ok: true, status: 'AUTHENTICATED', user: this.currentUser };
    }
    return { ok: false, status: 'DISCONNECTED: Chưa đăng nhập', user: null };
  }

  // 1. Đăng nhập liên kết Google ID
  public static loginGoogle(name: string, email: string, role: 'TEACHER' | 'ADMIN' = 'TEACHER', picture?: string): UserAccount {
    const normEmail = email.trim().toLowerCase();
    let existing = this.users.get(normEmail);

    if (!existing) {
      existing = {
        id: `usr_g_${Date.now()}`,
        name: name || normEmail.split('@')[0],
        email: normEmail,
        role,
        picture,
        auth_provider: 'google',
        email_verified: true,
        school: 'TRƯỜNG THCS QUANG TRUNG',
        authenticated_at: new Date().toISOString()
      };
      this.users.set(normEmail, existing);
    } else {
      existing.authenticated_at = new Date().toISOString();
      if (name) existing.name = name;
      if (picture) existing.picture = picture;
    }

    this.currentUser = existing;
    return this.currentUser;
  }

  // 2. Tự đăng ký bằng Email cá nhân (Khởi tạo OTP xác minh về email)
  public static registerEmail(
    name: string,
    email: string,
    password: string,
    school?: string,
    subject?: string
  ): { ok: boolean; message?: string; email?: string; simulated_otp?: string; error?: string } {
    const normEmail = email.trim().toLowerCase();

    if (!normEmail || !normEmail.includes('@')) {
      return { ok: false, error: 'Địa chỉ email không hợp lệ.' };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên.' };
    }

    const existing = this.users.get(normEmail);
    if (existing && existing.email_verified) {
      return { ok: false, error: 'Email này đã được đăng ký và xác minh. Thầy/Cô vui lòng đăng nhập.' };
    }

    // Sinh mã xác thực OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Hiệu lực trong 15 phút

    this.otpStore.set(normEmail, {
      code: otp,
      expiresAt,
      name: name || normEmail.split('@')[0],
      password,
      school: school || 'TRƯỜNG THCS QUANG TRUNG',
      subject: subject || 'Toán học'
    });

    console.log(`[AUTH-SERVICE] 📧 Mã OTP xác minh cho email ${normEmail}: [ ${otp} ] (Hiệu lực 15 phút)`);

    return {
      ok: true,
      message: `Hệ thống đã gửi mã OTP 6 số về hòm thư ${normEmail}. Vui lòng nhập mã để kích hoạt tài khoản.`,
      email: normEmail,
      simulated_otp: otp
    };
  }

  // 3. Xác minh mã OTP gửi về email cá nhân
  public static verifyEmail(email: string, code: string): { ok: boolean; user?: UserAccount; message?: string; error?: string } {
    const normEmail = email.trim().toLowerCase();
    const cleanCode = code ? code.trim() : '';

    const pending = this.otpStore.get(normEmail);
    if (!pending) {
      return { ok: false, error: 'Không tìm thấy yêu cầu xác minh hoặc mã đã hết hạn. Vui lòng bấm Gửi lại mã.' };
    }

    if (Date.now() > pending.expiresAt) {
      this.otpStore.delete(normEmail);
      return { ok: false, error: 'Mã xác minh OTP đã hết hạn (quá 15 phút). Vui lòng yêu cầu gửi mã mới.' };
    }

    if (pending.code !== cleanCode && cleanCode !== '888888') { // '888888' là mã master dự phòng kiểm thử
      return { ok: false, error: 'Mã OTP không chính xác. Vui lòng kiểm tra lại hòm thư email cá nhân.' };
    }

    // Xác minh thành công -> Lưu người dùng chính thức
    const newUser: UserAccount = {
      id: `usr_mail_${Date.now()}`,
      name: pending.name,
      email: normEmail,
      role: 'TEACHER',
      auth_provider: 'email_password',
      password: pending.password,
      email_verified: true,
      school: pending.school || 'TRƯỜNG THCS QUANG TRUNG',
      subject: pending.subject || 'Toán học',
      authenticated_at: new Date().toISOString()
    };

    this.users.set(normEmail, newUser);
    this.otpStore.delete(normEmail);
    this.currentUser = newUser;

    return {
      ok: true,
      user: newUser,
      message: `Xác minh tài khoản email thành công! Chào mừng Thầy/Cô ${newUser.name}.`
    };
  }

  // 4. Gửi lại mã xác minh OTP
  public static resendOtp(email: string): { ok: boolean; message: string; simulated_otp?: string; error?: string } {
    const normEmail = email.trim().toLowerCase();
    const pending = this.otpStore.get(normEmail);

    const name = pending ? pending.name : (this.users.get(normEmail)?.name || 'Giáo viên');
    const password = pending ? pending.password : (this.users.get(normEmail)?.password || 'password123');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    this.otpStore.set(normEmail, {
      code: otp,
      expiresAt,
      name,
      password
    });

    console.log(`[AUTH-SERVICE] 📧 Đã gửi lại mã OTP cho email ${normEmail}: [ ${otp} ]`);

    return {
      ok: true,
      message: `Đã gửi lại mã xác minh OTP mới đến hòm thư ${normEmail}.`,
      simulated_otp: otp
    };
  }

  // 5. Đăng nhập bằng Email cá nhân + Mật khẩu
  public static loginEmail(email: string, password: string): { ok: boolean; user?: UserAccount; error?: string; unverified?: boolean } {
    const normEmail = email.trim().toLowerCase();
    const user = this.users.get(normEmail);

    if (!user) {
      return { ok: false, error: 'Email chưa được đăng ký trong hệ thống. Vui lòng bấm Đăng ký tài khoản.' };
    }

    if (user.password && user.password !== password) {
      return { ok: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
    }

    if (!user.email_verified) {
      // Tự động kích hoạt gửi lại OTP
      this.resendOtp(normEmail);
      return {
        ok: false,
        unverified: true,
        error: 'Tài khoản chưa được xác minh email. Vui lòng nhập mã OTP đã gửi về hòm thư.'
      };
    }

    user.authenticated_at = new Date().toISOString();
    this.currentUser = user;
    return { ok: true, user: this.currentUser };
  }

  public static logout(): void {
    this.currentUser = null;
  }

  public static getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public static getAllUsers(): UserAccount[] {
    return Array.from(this.users.values());
  }
}
