export type UserStatus = "Active" | "Disabled";
export type UserRole = "Guest" | "Member" | "Staff" | "Admin";

export interface UserItem {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;        
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;

  hasDonorProfile?: boolean;
}
