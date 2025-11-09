// src/services/userService.ts
import api from "@/services/axios";
import type { UserItem, UserRole } from "@/types/user";

/* ================= Helpers ================= */

const toBool = (v: any) =>
  typeof v === "boolean" ? v : v === 1 || v === "1" || String(v).toLowerCase() === "true";

function mapRole(roleRaw: any): UserRole {
  const key = String(roleRaw ?? "").toUpperCase();
  const map: Record<string, UserRole> = {
    ADMIN: "Admin",
    STAFF: "Staff",
    MEMBER: "Member",
    GUEST: "Guest",
  };
  return map[key] ?? "Member";
}

function mapUser(raw: any): UserItem {
  // role có thể nằm ở nhiều key khác nhau
  const roleRaw =
    raw?.role ??
    raw?.roleName ??
    raw?.role_code ??
    raw?.roleCode ??
    (Array.isArray(raw?.roles)
      ? raw.roles[0]?.name ?? raw.roles[0]?.roleCode ?? raw.roles[0]
      : undefined);

  const mapped: any = {
    userId: Number(raw?.userId ?? raw?.id ?? raw?.user_id),
    fullName: String(raw?.fullName ?? raw?.name ?? raw?.full_name ?? ""),
    email: String(raw?.email ?? ""),
    role: mapRole(roleRaw),
    status: toBool(raw?.isActive ?? raw?.is_active) ? "Active" : "Disabled",

    createdAt: raw?.createdAt ?? raw?.created_at ?? undefined,
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? undefined,

    phoneNumber: raw?.phoneNumber ?? raw?.phone_number ?? undefined,
    gender: raw?.gender ?? undefined,
    birthYear:
      typeof raw?.birthYear === "number"
        ? raw?.birthYear
        : raw?.birth_year
        ? Number(raw?.birth_year)
        : undefined,

    hasDonorProfile: !!(raw?.hasDonorProfile ?? raw?.isDonor),
  };

  // Hỗ trợ bloodType nếu BE trả về
  if (raw?.bloodType != null || raw?.blood_type != null) {
    mapped.bloodType = raw?.bloodType ?? raw?.blood_type;
  }

  return mapped as UserItem;
}

/* ================= Paged list ================= */

export type GetUsersPagedParams = {
  pageNumber?: number;
  pageSize?: number;
  q?: string;
};

export type GetUsersPagedResult = {
  items: UserItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export async function getUsersPaged(params: GetUsersPagedParams): Promise<GetUsersPagedResult> {
  const { pageNumber = 1, pageSize = 10, q } = params;

  const res = await api.get("/api/Users", {
    params: { pageNumber, pageSize, ...(q ? { q } : {}) },
  });

  const data = res.data;

  const rawItems =
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.data)  ? data.data  :
    Array.isArray(data)        ? data      : [];

  const items = rawItems.map(mapUser);

  const totalCount = Number(data?.totalCount ?? items.length ?? 0);
  const totalPages = Number(
    data?.totalPages ?? (totalCount ? Math.ceil(totalCount / pageSize) : 1)
  );

  const hasPrevious =
    typeof data?.hasPrevious === "boolean" ? data.hasPrevious : pageNumber > 1;

  const hasNext =
    typeof data?.hasNext === "boolean" ? data.hasNext : pageNumber < totalPages;

  return {
    items,
    pageNumber: Number(data?.pageNumber ?? pageNumber),
    pageSize: Number(data?.pageSize ?? pageSize),
    totalCount,
    totalPages,
    hasPrevious,
    hasNext,
  };
}

/* ================= Details ================= */

export async function getUser(userId: number | string): Promise<UserItem> {
  const res = await api.get(`/api/Users/${userId}`);
  return mapUser(res.data);
}

/* ================= Update (hỗ trợ profile, bloodType & nhiều biến thể role) ================= */

export type UpdateUserPayload = Partial<{
  fullName: string;
  email: string;
  isActive: boolean;

  phoneNumber: string | null;
  gender: "Male" | "Female" | "Other" | "";
  birthYear: number | null;

  bloodType: "" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

  // Các biến thể role thường gặp ở backend
  role: "ADMIN" | "STAFF" | "MEMBER" | "GUEST";
  roleCode: "ADMIN" | "STAFF" | "MEMBER" | "GUEST";
  roleName: "Admin" | "Staff" | "Member" | "Guest";
  roleId: number;
}>;

export async function updateUser(
  userId: number | string,
  payload: UpdateUserPayload
): Promise<UserItem> {
  const res = await api.put(`/api/Users/${userId}`, payload);
  return mapUser(res.data);
}

/* ================= Delete (hard) ================= */

export async function deleteUser(userId: number | string): Promise<void> {
  await api.delete(`/api/Users/${userId}`);
}

/* ================= Create (email, phoneNumber, fullName, birthYear, gender, role, bloodType) ================= */

export type CreateUserPayload = {
  fullName: string;
  email: string;
  /** Mặc định tạo Member nếu không truyền */
  role?: "ADMIN" | "STAFF" | "MEMBER" | "GUEST";
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  birthYear?: number;
  bloodType?: "" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

  /** Nếu backend yêu cầu password khi tạo, mở comment dòng dưới và gửi kèm:
   *  password?: string;
   */
};

export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  const body: any = {
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role ?? "MEMBER",          // gửi role ở dạng code
    phoneNumber: payload.phoneNumber,
    gender: payload.gender,
    birthYear: payload.birthYear,
    bloodType: payload.bloodType,
    // Nếu BE bắt buộc password khi tạo:
    // password: payload.password ?? "ChangeMe@123",
  };

  const res = await api.post("/api/Users", body);

  // Giả định BE trả về đối tượng user vừa tạo -> chuẩn hoá qua mapUser
  // Nếu BE trả về kiểu khác, bạn có thể chỉnh lại cho phù hợp.
  return mapUser(res.data);
}

