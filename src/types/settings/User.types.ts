// src/types/User.types.ts
import type { AuditTrails } from "../common/AuditLog.types";

export interface User {
    userId: number;
    userName: string;
    userEmail: string;
    phoneNumber: string;
    address: string;
    profileImagePath?: string;
    profilePic?: string;
    passwordHash?: string;
    oldPassword?: string;
    newPassword?: string;
    isActive?: boolean;
    islocked?: boolean;
    createAt?: string;
    lastlogin?: string;
    lastloginString?: string;
    createAtSyring: string;
    companyId?: number;
    companyName?: string
    auditLogs?: AuditTrails[];
}
