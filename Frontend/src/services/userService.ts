// src/services/userService.ts
import api from "@/services/axios";
import type { BloodType, UserItem, UserRole } from "@/types/user";

/* ============== Helpers ============== */
const toBool = (v: any) =>
  typeof v === "boolean" ? v : v === 1 || v === "1" || String(v).toLowerCase() === "true";

const roleApiToUi: Record<string, UserRole> = {
  ADMIN: "Admin",
  STAFF: "Staff",
  MEMBER: "Member",
  GUEST: "Guest",
};

const roleUiToApi: Record<UserRole, "ADMIN" | "STAFF" | "MEMBER" | "GUEST"> = {
  Admin: "ADMIN",
  Staff: "STAFF",
  Member: "MEMBER",
  Guest: "GUEST",
};

// Ưu tiên hiển thị role cao nhất nếu BE trả nhiều role
const rolePriority: Record<"ADMIN" | "STAFF" | "MEMBER" | "GUEST", number> = {
  ADMIN: 4,
  STAFF: 3,
  MEMBER: 2,
  GUEST: 1,
};

function normalizeToApiRoleCode(v: any): Array<"ADMIN" | "STAFF" | "MEMBER" | "GUEST"> {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .map((it) =>
        normalizeToApiRoleCode((it && (it.roleCode || it.name || it.code || it)) ?? it)
      )
      .flat();
  }
  const s = String(v).trim();
  const tokens = s.includes(",") || s.includes("|") ? s.split(/[,|]/) : [s];

  const out = tokens
    .map((t) => String(t).trim().toUpperCase())
    .filter(Boolean)
    .map((u) => {
      if (u in roleApiToUi) return u as "ADMIN" | "STAFF" | "MEMBER" | "GUEST";
      // hỗ trợ Title Case
      const ui = (u[0]?.toUpperCase() + u.slice(1).toLowerCase()) as UserRole;
      return roleUiToApi[ui] ?? undefined;
    })
    .filter(Boolean) as Array<"ADMIN" | "STAFF" | "MEMBER" | "GUEST">;

  // unique
  return Array.from(new Set(out));
}

/** Nhận mọi biến thể role và trả về UI role (Title Case), ưu tiên cao nhất */
function mapRoleFromAny(roleRaw: any): UserRole {
  const codes = normalizeToApiRoleCode(roleRaw);
  if (!codes.length) return "Member";
  const best = codes.sort((a, b) => rolePriority[b] - rolePriority[a])[0];
  return roleApiToUi[best];
}

/** Nhận mọi biến thể role và trả về API role (UPPER_CASE) */
function toApiRole(roleAny?: any): "ADMIN" | "STAFF" | "MEMBER" | "GUEST" | undefined {
  if (!roleAny) return undefined;
  const asUi = roleAny as UserRole;
  if (roleUiToApi[asUi]) return roleUiToApi[asUi];
  const upper = String(roleAny).toUpperCase();
  if (upper in roleApiToUi) return upper as any;
  return undefined;
}

/** Xoá các field undefined/null để body gọn gàng */
function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  Object.keys(obj).forEach((k) => {
    const v = (obj as any)[k];
    if (v !== undefined && v !== null) (out as any)[k] = v;
  });
  return out;
}

/** Chuẩn hoá user từ mọi kiểu response khác nhau */
function mapUser(raw: any): UserItem {
  // ✅ bóc lớp bọc nếu BE trả { success, message, data: {...} }
  const r = raw?.data ?? raw;

  // role có thể nằm ở nhiều key khác nhau
  const roleRaw =
    r?.role ??
    r?.roleName ??
    r?.role_code ??
    r?.roleCode ??
    (Array.isArray(r?.roles)
      ? r.roles[0]?.name ?? r.roles[0]?.roleCode ?? r.roles[0]
      : undefined);

  // blood type có thể có nhiều tên
  const blood =
    r?.bloodType ?? r?.blood_type ?? r?.bloodGroup ?? r?.blood_group ?? "";

  const mapped: UserItem = {
    userId: Number(r?.userId ?? r?.id ?? r?.user_id),
    fullName: String(r?.fullName ?? r?.name ?? r?.full_name ?? ""),
    email: String(r?.email ?? ""),
    role: mapRoleFromAny(roleRaw),
    status: toBool(r?.isActive ?? r?.is_active) ? "Active" : "Disabled",

    createdAt: r?.createdAt ?? r?.created_at ?? undefined,
    updatedAt: r?.updatedAt ?? r?.updated_at ?? undefined,

    phoneNumber: r?.phoneNumber ?? r?.phone_number ?? undefined,
    gender: r?.gender ?? undefined,
    birthYear:
      typeof r?.birthYear === "number"
        ? r?.birthYear
        : r?.birth_year
        ? Number(r?.birth_year)
        : undefined,

    bloodType: (blood ?? "") as BloodType,

    hasDonorProfile: !!(r?.hasDonorProfile ?? r?.isDonor),
  };

  return mapped;
}

/* ============== Paged list ============== */
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

/* ============== Details ============== */
export async function getUser(userId: number | string): Promise<UserItem> {
  const res = await api.get(`/api/Users/${userId}`);
  return mapUser(res.data);
}

/* ============== Update (retry theo từng "shape") ============== */
export type UpdateUserPayload = Partial<{
  fullName: string;
  email: string;
  isActive: boolean;

  phoneNumber: string | null;
  gender: "Male" | "Female" | "Other" | "";
  birthYear: number | null;

  bloodType: BloodType;

  // Các biến thể role thường gặp ở backend
  role: "ADMIN" | "STAFF" | "MEMBER" | "GUEST" | UserRole; // chấp nhận cả Title Case
  roleCode: "ADMIN" | "STAFF" | "MEMBER" | "GUEST";
  roleName: UserRole;
  roleId: number;
}>;

export async function updateUser(
  userId: number | string,
  payload: UpdateUserPayload
): Promise<UserItem> {
  const apiRole =
    toApiRole(payload.role) ??
    toApiRole(payload.roleCode) ??
    toApiRole(payload.roleName);

  // Base fields (không chứa role)
  const base = compact({
    fullName: payload.fullName,
    email: payload.email, // một số BE yêu cầu gửi lại email khi update
    isActive: typeof payload.isActive === "boolean" ? payload.isActive : undefined,

    phoneNumber: payload.phoneNumber,
    gender: payload.gender,
    birthYear: payload.birthYear,
    bloodType: payload.bloodType,

    roleId: payload.roleId,
  });

  // Thử lần lượt các "shape" phổ biến để tránh BE reject
  const candidates: Array<Record<string, any>> = [];
  if (apiRole) {
    candidates.push({ ...base, role: apiRole });                  // 1) role
    candidates.push({ ...base, roleCode: apiRole });              // 2) roleCode
    candidates.push({ ...base, roles: [apiRole] });               // 3) roles (mảng)
    candidates.push({ ...base, roleName: roleApiToUi[apiRole] }); // 4) roleName (Title Case)
  } else {
    candidates.push(base);
  }

  let lastErr: any = null;

  for (const body of candidates) {
    try {
      const res = await api.put(`/api/Users/${userId}`, body);
      if (!res.data || res.status === 204) {
        const fresh = await api.get(`/api/Users/${userId}`);
        return mapUser(fresh.data);
      }
      return mapUser(res.data);
    } catch (e: any) {
      lastErr = e;
      // Không phụ thuộc vào status (phòng trường hợp interceptor wrap lỗi)
      continue;
    }
  }

  throw lastErr ?? new Error("Failed to update user.");
}

/* ============== Delete (hard) ============== */
export async function deleteUser(userId: number | string): Promise<void> {
  await api.delete(`/api/Users/${userId}`);
}

/* ============== Create ============== */
export type CreateUserPayload = {
  fullName: string;
  email: string;
  /** Mặc định tạo Member nếu không truyền */
  role?: "ADMIN" | "STAFF" | "MEMBER" | "GUEST" | UserRole;
  phoneNumber?: string;
  gender?: "Male" | "Female" | "Other";
  birthYear?: number;
  bloodType?: BloodType;

  // password?: string; // nếu BE yêu cầu
};

export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  const apiRole = toApiRole(payload.role) ?? "MEMBER";

  // Với create, đa phần BE nhận "role" duy nhất; nếu BE của bạn yêu cầu khác,
  // có thể thêm roleCode/roles/roleName tương tự như update.
  const body = compact({
    fullName: payload.fullName,
    email: payload.email,
    role: apiRole, // gửi role ở dạng code
    phoneNumber: payload.phoneNumber,
    gender: payload.gender,
    birthYear: payload.birthYear,
    bloodType: payload.bloodType,
    // password: payload.password ?? "ChangeMe@123",
  });

  const res = await api.post("/api/Users", body);
  return mapUser(res.data);
}
