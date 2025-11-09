// src/types/user.ts
export type UserStatus = "Active" | "Disabled";
export type UserRole   = "Admin" | "Staff" | "Member" | "Guest";
export type Gender     = "Male" | "Female" | "Other";

/** Nhóm máu dùng cho hồ sơ người dùng */
export type BloodType =
  | ""
  | "A+" | "A-"
  | "B+" | "B-"
  | "AB+" | "AB-"
  | "O+" | "O-";

export interface UserItem {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;

  createdAt?: string;
  updatedAt?: string;

  // các field profile (có thể BE không trả thì để optional)
  phoneNumber?: string | null;
  gender?: Gender;
  birthYear?: number | null;
  bloodType?: BloodType;     // ⬅️ NEW

  hasDonorProfile?: boolean;
}

/* (Tuỳ chọn) dùng chung cho form tạo/cập nhật */
export type CreateUserPayload = {
  fullName: string;
  email: string;
  role?: "ADMIN" | "STAFF" | "MEMBER" | "GUEST"; // chú ý: code role gửi lên BE dạng UPPER_CASE
  phoneNumber?: string | null;
  gender?: Gender;
  birthYear?: number | null;
  bloodType?: BloodType;     // ⬅️ NEW
};

export type UpdateUserPayload = Partial<CreateUserPayload> & {
  isActive?: boolean;
};
