import type { AuditTrails } from "./AuditLog.types";

// src/types/Auth.types.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  userId: number;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  address: string;
  profileImagePath?: string;
  profilePic?: string;
  passwordHash: string;
  oldPassword?: string;
  newPassword?: string;
  isActive: boolean;
  islocked: boolean;
  createAt: string;
  lastlogin: string;
  lastloginString: string;
  createAtSyring: string;
  companyId?: number;
  companyName?: string
  auditLogs?: AuditTrails[];
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}
