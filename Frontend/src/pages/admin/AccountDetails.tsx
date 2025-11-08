// src/pages/admin/AccountDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Mail,
  Phone,
  Shield,
  User2,
  IdCard,
  CalendarClock,
  CalendarDays, // 👈 NEW: icon cho Birth year
  Mars,         // 👈 NEW: icon nam
  Venus,        // 👈 NEW: icon nữ
} from "lucide-react";
import { getUser as getUserById, getUserProfileById } from "@/services/userService";
import type { UserItem } from "@/types/user";

/* ---------- Helpers ---------- */
function StatusPill({ value }: { value: "Active" | "Disabled" }) {
  const cls =
    value === "Active"
      ? "text-green-700 bg-green-100 border-green-200"
      : "text-amber-700 bg-amber-100 border-amber-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}

function RolePill({ role }: { role: string }) {
  const map: Record<string, string> = {
    Admin: "bg-blue-100 text-blue-700 border-blue-200",
    Staff: "bg-purple-100 text-purple-700 border-purple-200",
    Member: "bg-neutral-100 text-neutral-700 border-neutral-200",
    Guest: "bg-neutral-100 text-neutral-700 border-neutral-200",
  };
  const cls = map[role] ?? map.Member;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {role}
    </span>
  );
}

function DonorPill({ yes }: { yes: boolean }) {
  if (!yes) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 border-red-200">
      <span>🩸</span> Donor
    </span>
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const [a, b] = [parts[0]?.[0], parts[parts.length - 1]?.[0]];
  const ini = (a || "") + (b || "");
  return ini.toUpperCase().slice(0, 2) || "U";
}

function splitEvery(s: string, n: number) {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out.join(" ");
}

function formatPhonePretty(raw?: string | null): { prefix?: string; rest?: string } {
  if (!raw) return {};
  const compact = raw.replace(/[^\d+]/g, "");
  let rest = compact;
  let isVN = false;

  if (compact.startsWith("+84")) {
    isVN = true;
    rest = compact.slice(3);
  } else if (compact.startsWith("84")) {
    isVN = true;
    rest = compact.slice(2);
  }
  if (rest.startsWith("0")) rest = rest.slice(1);

  rest = splitEvery(rest, 3).trim();
  return { prefix: isVN ? "🇻🇳 +84" : undefined, rest };
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

/* ---------- Small building blocks ---------- */
function LineItem({
  icon,
  label,
  value,
  compact = false,
  mono = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  compact?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${compact ? "py-1.5" : "py-2"}`}>
      {icon && <div className="mt-0.5 text-neutral-500">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-neutral-600">{label}</div>
        <div
          className={`mt-0.5 text-sm ${mono ? "font-medium tabular-nums tracking-tight" : ""} truncate`}
          title={typeof value === "string" ? value : undefined}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [user, setUser] = useState<UserItem | null>(null);

  // fallback từ /profile nếu có
  const [genderFallback, setGenderFallback] = useState<string | undefined>();
  const [birthYearFallback, setBirthYearFallback] = useState<number | undefined>();

  useEffect(() => {
    const userId = Number(id);
    if (!id || Number.isNaN(userId)) {
      setErr("Invalid user id");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [uRes, pRes] = await Promise.allSettled([
          getUserById(userId),
          getUserProfileById(userId),
        ]);

        if (uRes.status === "fulfilled") setUser(uRes.value);
        else throw new Error((uRes as any).reason?.message ?? "Failed to load user");

        if (pRes.status === "fulfilled" && pRes.value) {
          const p = pRes.value as any;
          if (p?.gender) setGenderFallback(p.gender);
          if (p?.birthYear) setBirthYearFallback(p.birthYear);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load user");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const initials = useMemo(() => initialsOf(user?.fullName ?? ""), [user?.fullName]);
  const phone = formatPhonePretty(user?.phoneNumber ?? undefined);
  const gender = user?.gender ?? genderFallback ?? "—";
  const birthYear =
    typeof user?.birthYear === "number"
      ? String(user?.birthYear)
      : typeof birthYearFallback === "number"
      ? String(birthYearFallback)
      : "—";

  // 👇 NEW: icon giới tính động
  const genderIcon = useMemo(() => {
    const g = String(gender).toLowerCase();
    if (g.includes("male")) return <Mars className="h-4 w-4" />;
    if (g.includes("female")) return <Venus className="h-4 w-4" />;
    return <User2 className="h-4 w-4" />;
  }, [gender]);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => nav("/admin/accounts")} className="rounded-xl">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Account Details</h1>
      </div>

      {/* Hero header */}
      <Card className="rounded-2xl overflow-hidden">
        <div className="h-20 bg-white" />
        <CardContent className="-mt-10">
          {loading && <p className="text-neutral-500">Loading…</p>}
          {!loading && err && <p className="text-red-600">[ERR] {err}</p>}

          {!loading && !err && user && (
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* avatar */}
              <div className="h-16 w-16 rounded-2xl bg-red-600/10 text-red-700 grid place-items-center text-lg font-bold ring-1 ring-red-600/20">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="text-xl font-semibold truncate">{user.fullName || "—"}</div>
                <div className="text-sm text-neutral-600 truncate flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email || "—"}</span>
                </div>
              </div>

              <div className="md:ml-auto flex flex-wrap items-center gap-2">
                <RolePill role={user.role} />
                <StatusPill value={user.status} />
                <DonorPill yes={!!user.hasDonorProfile} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: profile blocks */}
        <Card className="rounded-2xl xl:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {loading && <p className="text-neutral-500">Loading…</p>}
            {!loading && err && <p className="text-red-600">[ERR] {err}</p>}

            {!loading && !err && user && (
              <>
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-2">
                    <LineItem icon={<IdCard className="h-4 w-4" />} label="User ID" value={String(user.userId)} compact mono />
                  </div>
                  <div className="md:col-span-6">
                    <LineItem icon={<User2 className="h-4 w-4" />} label="Full name" value={user.fullName || "—"} compact />
                  </div>
                  <div className="md:col-span-4">
                    <LineItem icon={<Shield className="h-4 w-4" />} label="Role" value={user.role || "—"} compact />
                  </div>
                </div>

                <div className="h-px bg-neutral-200/70 my-2" />

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <LineItem
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone number"
                      value={
                        <span className="inline-flex items-center gap-2">
                          {phone.prefix && (
                            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700">
                              {phone.prefix}
                            </span>
                          )}
                          <span className="tabular-nums tracking-tight">{phone.rest || user.phoneNumber || "—"}</span>
                        </span>
                      }
                      compact
                    />
                  </div>
                  <div className="md:col-span-3">
                    {/* 👇 NEW: icon lịch cho Birth year */}
                    <LineItem icon={<CalendarDays className="h-4 w-4" />} label="Birth year" value={birthYear} compact mono />
                  </div>
                  <div className="md:col-span-4">
                    {/* 👇 NEW: icon giới tính động */}
                    <LineItem icon={genderIcon} label="Gender" value={gender} compact />
                  </div>
                </div>

                <div className="h-px bg-neutral-200/70 my-2" />

                {/* Row 3 (gộp Status | Created at | Email) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <div className="flex items-start gap-3 py-1.5">
                      <div className="mt-0.5 text-neutral-500">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-neutral-600">Status</div>
                        <div className="mt-1">
                          <StatusPill value={user.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <LineItem icon={<CalendarClock className="h-4 w-4" />} label="Created at" value={formatDate(user.createdAt)} compact />
                  </div>
                  <div className="md:col-span-5">
                    <LineItem icon={<Mail className="h-4 w-4" />} label="Email" value={user.email || "—"} compact />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: quick facts / future actions */}
        <Card className="rounded-2xl xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Quick facts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-neutral-500">Loading…</p>}
            {!loading && err && <p className="text-red-600">[ERR] {err}</p>}

            {!loading && !err && user && (
              <>
                <LineItem label="Account status" value={<StatusPill value={user.status} />} />
                <LineItem label="Role" value={<RolePill role={user.role} />} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity placeholder */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Activity history</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            (Coming soon) Hiển thị các hoạt động gần đây của user.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
