// src/services/userService.ts
import { api } from "@/services/http";
import type { UserItem, UserRole } from "@/types/user";

function mapUser(raw: any): UserItem {
  const roleRaw =
    raw?.role ??
    raw?.roleName ??
    raw?.role_code ??
    (Array.isArray(raw?.roles) ? raw.roles[0] : "MEMBER");

  const roleKey = String(roleRaw ?? "MEMBER").toUpperCase();
  const roleMap: Record<string, UserRole> = {
    ADMIN: "Admin",
    STAFF: "Staff",
    MEMBER: "Member",
    GUEST: "Guest",
  };

  return {
    userId: Number(raw?.userId ?? raw?.id ?? raw?.user_id),
    fullName: String(raw?.fullName ?? raw?.name ?? raw?.full_name ?? ""),
    email: String(raw?.email ?? ""),
    role: roleMap[roleKey] ?? "Member",
    status: raw?.isActive ? "Active" : "Disabled",
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
    hasDonorProfile: !!(raw?.hasDonorProfile ?? raw?.isDonor),
  };
}

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

/** /api/Users?pageNumber=&pageSize=&q=  (API phân trang) */
export async function getUsersPaged(
  params: GetUsersPagedParams
): Promise<GetUsersPagedResult> {
  const { pageNumber = 1, pageSize = 10, q } = params;

  // Axios sẽ tự build query từ "params"
  const res = await api.get("/api/Users", {
    params: { pageNumber, pageSize, q },
  });

  const data = res.data;

  // Chuẩn hoá nhiều schema có thể gặp
  const rawItems =
    Array.isArray(data?.items) ? data.items :
    Array.isArray(data?.data) ? data.data :
    Array.isArray(data) ? data : [];

  return {
    items: rawItems.map(mapUser),
    pageNumber: Number(data?.pageNumber ?? pageNumber),
    pageSize: Number(data?.pageSize ?? pageSize),
    totalCount: Number(data?.totalCount ?? rawItems.length ?? 0),
    totalPages: Number(data?.totalPages ?? 1),
    hasPrevious: !!data?.hasPrevious,
    hasNext: !!data?.hasNext,
  };
}

/* ——— Optional: nếu cần dùng ở các dialog ——— */

export async function getUser(userId: number): Promise<UserItem> {
  const res = await api.get(`/api/Users/${userId}`);
  return mapUser(res.data);
}

export async function updateUser(
  userId: number,
  payload: Partial<{ fullName: string; email: string; isActive: boolean }>
): Promise<UserItem> {
  const res = await api.put(`/api/Users/${userId}`, payload);
  return mapUser(res.data);
}

/** Gán vai trò. Nếu API của bạn khác, đổi body/path cho khớp. */
export async function updateUserRole(
  userId: number,
  roleCode: "ADMIN" | "STAFF" | "MEMBER" | "GUEST"
): Promise<UserItem> {
  const res = await api.put(`/api/Users/${userId}`, { role: roleCode });
  return mapUser(res.data);
}
