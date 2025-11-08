// src/services/userService.ts
import { api } from "@/services/http";
import type { UserItem, UserRole } from "@/types/user";

/* Helpers */
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
  const roleRaw =
    raw?.role ??
    raw?.roleName ??
    raw?.role_code ??
    raw?.roleCode ??
    (Array.isArray(raw?.roles)
      ? raw.roles[0]?.name ?? raw.roles[0]?.roleCode ?? raw.roles[0]
      : undefined);

  return {
    userId: Number(raw?.userId ?? raw?.id ?? raw?.user_id),
    fullName: String(raw?.fullName ?? raw?.name ?? raw?.full_name ?? ""),
    email: String(raw?.email ?? ""),
    role: mapRole(roleRaw),
    status: toBool(raw?.isActive ?? raw?.is_active) ? "Active" : "Disabled",

    createdAt: raw?.createdAt ?? raw?.created_at ?? undefined,
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? undefined,

    // profile-ish fields (nếu backend trả về)
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
}

/* ========= Paged list ========= */

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
    params: { pageNumber, pageSize, q },
  });

  const data = res.data;
  const rawItems =
    Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

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

/* ========= Create ========= */

// Mật khẩu mặc định đồng bộ với backend
export const DEFAULT_PASSWORD = "Thanhdeptrai@2004";

export type CreateUserPayload = {
  fullName: string;
  email: string;
  password?: string; // nếu không truyền, FE sẽ gán DEFAULT_PASSWORD
  role?: "ADMIN" | "STAFF" | "MEMBER" | "GUEST"; // gửi lên dưới field roleCode
  isActive?: boolean;
  phoneNumber?: string | null;
  gender?: "Male" | "Female" | "Other";
  birthYear?: number | null;
};

export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  // Chuyển về shape backend đang nhận (CreateUserCommand dùng RoleCode/PhoneNumber)
  const body = {
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber ?? null,
    roleCode: payload.role ?? "MEMBER",
    isActive: payload.isActive ?? true,
    password:
      payload.password && payload.password.trim()
        ? payload.password
        : DEFAULT_PASSWORD,
    // nếu backend không dùng gender/birthYear thì vẫn gửi cũng không sao
    gender: payload.gender,
    birthYear: payload.birthYear,
  };

  const res = await api.post("/api/Users", body);
  return mapUser(res.data);
}

/* ========= Details ========= */

export async function getUser(userId: number | string): Promise<UserItem> {
  const res = await api.get(`/api/Users/${userId}`);
  return mapUser(res.data);
}

/** Optional: GET /api/Users/{id}/profile (nếu backend có) */
export async function getUserProfileById(
  userId: number | string
): Promise<{ fullName?: string; gender?: string; birthYear?: number }> {
  try {
    const res = await api.get(`/api/Users/${userId}/profile`);
    const d = res?.data ?? {};
    return {
      fullName: d?.fullName ?? d?.full_name,
      gender: d?.gender,
      birthYear: Number(d?.birthYear ?? d?.birth_year) || undefined,
    };
  } catch {
    // Backend có thể không có route này
    return {};
  }
}

/* ========= Update ========= */

// Hợp nhất luôn các field profile vào PUT /api/Users/{id}
export type UpdateUserPayload = Partial<{
  fullName: string;
  email: string;
  isActive: boolean;
  role: "ADMIN" | "STAFF" | "MEMBER" | "GUEST";

  // thêm các field dưới nếu backend cho update chung
  phoneNumber: string | null;
  gender: "Male" | "Female" | "Other";
  birthYear: number | null;
}>;

export async function updateUser(
  userId: number | string,
  payload: UpdateUserPayload
): Promise<UserItem> {
  // Gửi roleCode nếu bạn dùng role dạng code ở BE
  const body: any = { ...payload };
  if (payload.role) {
    body.roleCode = payload.role;
    delete body.role;
  }
  const res = await api.put(`/api/Users/${userId}`, body);
  return mapUser(res.data);
}

/**
 * (Tùy chọn) Nếu sau này backend tạo route /api/Users/{id}/profile
 * thì có thể dùng. Hiện tại nhiều server trả 404/405 nên mình swallow 404/405.
 */
export type UpdateUserProfilePayload = Partial<{
  phoneNumber: string;
  gender: "Male" | "Female" | "Other";
  birthYear: number;
}>;

export async function updateUserProfile(
  userId: number | string,
  payload: UpdateUserProfilePayload
): Promise<void> {
  try {
    await api.put(`/api/Users/${userId}/profile`, payload);
  } catch (e: any) {
    const code = e?.response?.status;
    // Bỏ qua nếu server chưa có route
    if (code !== 404 && code !== 405) throw e;
  }
}

/* ========= Delete / Restore ========= */

/** Xoá mềm: disable user (nếu backend có deactivatedAt bạn có thể set thêm ở đây) */
export async function softDeleteUser(userId: number | string): Promise<UserItem> {
  const res = await api.put(`/api/Users/${userId}`, { isActive: false });
  return mapUser(res.data);
}

/** Khôi phục user sau xoá mềm */
export async function restoreUser(userId: number | string): Promise<UserItem> {
  const res = await api.put(`/api/Users/${userId}`, { isActive: true });
  return mapUser(res.data);
}

/** Xoá cứng ngay lập tức */
export async function deleteUserHard(userId: number | string): Promise<void> {
  await api.delete(`/api/Users/${userId}`);
}

/** Giữ alias cũ để tương thích (mặc định là xoá cứng) */
export async function deleteUser(userId: number | string): Promise<void> {
  return deleteUserHard(userId);
}

/* ========= (Tuỳ chọn) Lên lịch xoá mềm sau X ngày =========
   Lưu ý: CHỈ dùng nếu backend có route tương ứng.
   - Cách 1: Backend có endpoint riêng /schedule-deletion
   - Cách 2 (fallback): Gửi PUT /api/Users/{id} với isActive=false và scheduledDeleteAt (ISO)
*/

export type ScheduleDeletionPayload = {
  /** Xoá vĩnh viễn sau N ngày (server tính ra scheduled time) */
  purgeAfterDays?: number;
  /** Hoặc truyền trực tiếp mốc thời gian ISO để purge */
  purgeAt?: string; // ISO string
};

/** Try endpoint chuyên dụng; fallback dùng PUT với scheduledDeleteAt (nếu server hỗ trợ) */
export async function scheduleUserDeletion(
  userId: number | string,
  payload: ScheduleDeletionPayload
): Promise<void> {
  // Ưu tiên endpoint riêng (nếu có)
  try {
    await api.post(`/api/Users/${userId}/schedule-deletion`, payload);
    return;
  } catch (e: any) {
    const code = e?.response?.status;
    if (code !== 404 && code !== 405) throw e;
  }

  // Fallback: nếu server không có endpoint riêng, thử update trực tiếp
  const now = Date.now();
  const iso =
    payload.purgeAt ??
    (payload.purgeAfterDays
      ? new Date(now + payload.purgeAfterDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined);

  // Nếu không xác định được thời điểm, coi như chỉ disable (xóa mềm bình thường)
  if (!iso) {
    await softDeleteUser(userId);
    return;
  }

  try {
    // Nhiều backend sẽ bỏ qua field lạ; nếu server không hỗ trợ scheduledDeleteAt thì không sao.
    await api.put(`/api/Users/${userId}`, {
      isActive: false,
      scheduledDeleteAt: iso,
    });
  } catch (e: any) {
    // Nếu không hỗ trợ luôn, ít nhất vẫn xóa mềm
    await softDeleteUser(userId);
  }
}

/** Huỷ lịch xoá (nếu backend hỗ trợ) */
export async function cancelScheduledDeletion(userId: number | string): Promise<void> {
  // Thử endpoint riêng
  try {
    await api.delete(`/api/Users/${userId}/schedule-deletion`);
    return;
  } catch (e: any) {
    const code = e?.response?.status;
    if (code !== 404 && code !== 405) throw e;
  }

  // Fallback: xoá trường scheduledDeleteAt nếu server hỗ trợ; đồng thời có thể bật lại isActive nếu cần
  try {
    await api.put(`/api/Users/${userId}`, {
      scheduledDeleteAt: null,
    });
  } catch {
    // ignore nếu server không có
  }
}

/* ========= (Tuỳ chọn) tiện ích bulk ========= */

export async function toggleUserActive(
  userId: number | string,
  isActive: boolean
): Promise<UserItem> {
  const res = await api.put(`/api/Users/${userId}`, { isActive });
  return mapUser(res.data);
}

export async function bulkSoftDelete(userIds: Array<number | string>): Promise<void> {
  await Promise.all(userIds.map((id) => softDeleteUser(id)));
}

export async function bulkRestore(userIds: Array<number | string>): Promise<void> {
  await Promise.all(userIds.map((id) => restoreUser(id)));
}
