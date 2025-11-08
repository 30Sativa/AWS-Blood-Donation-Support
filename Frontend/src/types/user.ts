export type UserRole = "Admin" | "Staff" | "Member" | "Guest";

export type UserItem = {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: "Active" | "Disabled";

  phoneNumber?: string | null;
  gender?: string | null;
  birthYear?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  hasDonorProfile?: boolean;
};
