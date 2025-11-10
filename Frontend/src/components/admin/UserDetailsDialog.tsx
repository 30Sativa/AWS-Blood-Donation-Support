import React, { useEffect, useState } from "react";
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Phone,
  VenetianMask,
  CalendarClock,
  CalendarDays,
  IdCard
} from "lucide-react";
import { getUser } from "@/services/userService";
import type { UserItem } from "@/types/user";

type Props = {
  open: boolean;
  userId: number | string | null;
  onClose: () => void;
};

export default function UserDetailsDialog({ open, userId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [user, setUser] = useState<UserItem | null>(null);

  // reset khi đóng
  useEffect(() => {
    if (!open) {
      setUser(null);
      setErr(null);
      setLoading(false);
    }
  }, [open]);

  // load chi tiết khi mở
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || userId == null) return;
      setLoading(true);
      setErr(null);
      try {
        const u = await getUser(userId);
        if (!cancelled) setUser(u);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load user details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [open, userId]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/30 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="User details"
        className={`fixed z-[71] left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl border transition-transform duration-200 ${open ? "scale-100" : "scale-95 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-neutral-600" />
            <h2 className="text-lg font-semibold">User details</h2>
          </div>
          <button className="p-2 rounded-lg hover:bg-neutral-100" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading && <div className="text-neutral-500">Loading…</div>}
          {!loading && err && <div className="text-red-600">{err}</div>}
          {!loading && !err && user && (
            <div className="grid grid-cols-1 gap-3">
              <Section title="Basic">
                <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Full name" value={user.fullName} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
                <InfoRow icon={<Shield className="h-4 w-4" />} label="Role" value={user.role} />
                <InfoRow
                  icon={user.status === "Active" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-amber-600" />}
                  label="Status"
                  value={user.status}
                  valueClass={user.status === "Active" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100"}
                  pill
                />
              </Section>

              {(user.phoneNumber || user.gender || user.birthYear) && (
                <Section title="Profile">
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phoneNumber ?? "—"} />
                  <InfoRow icon={<VenetianMask className="h-4 w-4" />} label="Gender" value={user.gender ?? "—"} />
                  <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Birth year" value={user.birthYear ?? "—"} />
                </Section>
              )}

              {(user.createdAt || user.updatedAt) && (
                <Section title="Meta">
                  <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Created at" value={formatTS(user.createdAt)} />
                  <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Updated at" value={formatTS(user.updatedAt)} />
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border">
      <div className="px-3 py-2 border-b text-sm font-medium text-neutral-600">{title}</div>
      <div className="p-3 grid grid-cols-1 gap-2">{children}</div>
    </div>
  );
}

function InfoRow({
  icon, label, value, pill, valueClass,
}: { icon: React.ReactNode; label: string; value?: React.ReactNode; pill?: boolean; valueClass?: string; }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 rounded-md border bg-white p-1.5">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-neutral-500">{label}</div>
        {pill ? (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${valueClass ?? ""}`}>{value ?? "—"}</span>
        ) : (
          <div className="text-sm mt-0.5">{value ?? "—"}</div>
        )}
      </div>
    </div>
  );
}

function formatTS(ts?: string) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}
