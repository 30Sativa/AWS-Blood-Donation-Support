// src/pages/admin/components/EditAccountDialog.tsx
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Phone as PhoneIcon,
  Calendar as CalendarIcon,
  VenetianMask,
  Droplets,
  Shield,
  X,
} from "lucide-react";
import { updateUser } from "@/services/userService";
import type { UserItem } from "@/types/user";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserItem | null;
  onSaved: () => void | Promise<void>;
};

const BLOOD_TYPES = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodType = (typeof BLOOD_TYPES)[number];

// Map label ↔ code cho role
const roleLabelToCode = (label: string): "ADMIN" | "STAFF" | "MEMBER" | "GUEST" => {
  const map: Record<string, "ADMIN" | "STAFF" | "MEMBER" | "GUEST"> = {
    Admin: "ADMIN",
    Staff: "STAFF",
    Member: "MEMBER",
    Guest: "GUEST",
  };
  return map[label] ?? "MEMBER";
};
const roleCodeToLabel = (code?: string): "Admin" | "Staff" | "Member" | "Guest" => {
  const map: Record<string, "Admin" | "Staff" | "Member" | "Guest"> = {
    ADMIN: "Admin",
    STAFF: "Staff",
    MEMBER: "Member",
    GUEST: "Guest",
  };
  return map[code ?? ""] ?? "Member";
};

export default function EditAccountDialog({ open, onOpenChange, user, onSaved }: Props) {
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [birthYear, setBirthYear] = React.useState<string>("");
  const [gender, setGender] = React.useState<"" | "Male" | "Female" | "Other">("");
  const [bloodType, setBloodType] = React.useState<BloodType>("");
  const [roleLabel, setRoleLabel] = React.useState<"Admin" | "Staff" | "Member" | "Guest">("Member");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // đồng bộ data khi mở
  React.useEffect(() => {
    if (!open || !user) return;
    setFullName(user.fullName ?? "");
    setPhoneNumber((user as any).phoneNumber ?? "");
    setBirthYear((user as any).birthYear ? String((user as any).birthYear) : "");
    setGender(((user as any).gender as any) ?? "");
    setBloodType(((user as any).bloodType as any) ?? "");
    // user.role đã là dạng label "Admin/Staff/Member/Guest"
    setRoleLabel(user.role ? (user.role as any) : "Member");
    setError(null);
    setSaving(false);
  }, [open, user]);

  function validate() {
    if (!fullName.trim()) return "Full name is required.";
    if (birthYear) {
      const n = Number(birthYear);
      const year = new Date().getFullYear();
      if (!Number.isFinite(n) || n < 1900 || n > year) return "Birth year is invalid.";
    }
    if (phoneNumber && !/^[+0-9\s()-]{6,20}$/.test(phoneNumber)) {
      return "Phone number looks invalid.";
    }
    return null;
  }

  async function onSave() {
    if (!user) return;
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const roleCode = roleLabelToCode(roleLabel);
      await updateUser(user.userId, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        birthYear: birthYear ? Number(birthYear) : null,
        gender: (gender || undefined) as any,
        bloodType: bloodType || undefined,
        // Gửi đủ các biến thể role để tương thích nhiều backend
        role: roleCode,
        roleCode: roleCode,
        roleName: roleLabel,
      } as any);

      await onSaved();
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Full name */}
          <Field
            label="Full name"
            icon={<UserIcon className="h-4 w-4" />}
            input={
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="rounded-xl"
              />
            }
          />

          {/* Phone */}
          <Field
            label="Phone number"
            icon={<PhoneIcon className="h-4 w-4" />}
            input={
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+84 123 456 789"
                className="rounded-xl"
              />
            }
          />

          {/* Birth year */}
          <Field
            label="Birth year"
            icon={<CalendarIcon className="h-4 w-4" />}
            input={
              <Input
                inputMode="numeric"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="2001"
                className="rounded-xl"
              />
            }
          />

          {/* Gender */}
          <Field
            label="Gender"
            icon={<VenetianMask className="h-4 w-4" />}
            input={
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="">(Not set)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            }
          />

          {/* Blood type */}
          <Field
            label="Blood type"
            icon={<Droplets className="h-4 w-4" />}
            input={
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value as BloodType)}
              >
                {BLOOD_TYPES.map((t) => (
                  <option key={t || "(empty)"} value={t}>
                    {t || "(Not set)"}
                  </option>
                ))}
              </select>
            }
          />

          {/* Role */}
          <Field
            label="Role"
            icon={<Shield className="h-4 w-4" />}
            input={
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value as any)}
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Member">Member</option>
                <option value="Guest">Guest</option>
              </select>
            }
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            className="rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
          <Button className="rounded-lg" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  icon,
  input,
}: {
  label: string;
  icon: React.ReactNode;
  input: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded-md border bg-white p-2">{icon}</span>
        <div className="flex-1">{input}</div>
      </div>
    </div>
  );
}
