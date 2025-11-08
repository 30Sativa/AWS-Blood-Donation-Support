// src/pages/admin/components/EditAccountDialog.tsx
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RoleSelect from "./RoleSelect";
import GenderRadio, { type GenderValue } from "./GenderRadio";
import PhoneInput from "./PhoneInput";
import type { UserItem } from "@/types/user";
import { updateUser, updateUserProfile } from "@/services/userService";

type RoleCode = "MEMBER" | "STAFF" | "ADMIN";

function roleToCode(roleLabel: string): RoleCode {
  const map: Record<string, RoleCode> = {
    Admin: "ADMIN",
    Staff: "STAFF",
    Member: "MEMBER",
    // fallback
    ADMIN: "ADMIN",
    STAFF: "STAFF",
    MEMBER: "MEMBER",
  };
  return map[roleLabel] ?? "MEMBER";
}

export default function EditAccountDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: UserItem | null;
  onSaved?: () => void; // callback refresh list
}) {
  const [fullName, setFullName] = React.useState("");
  const [role, setRole] = React.useState<RoleCode>("MEMBER");
  const [phone, setPhone] = React.useState<string | null>(null);
  const [gender, setGender] = React.useState<GenderValue>("Other");
  const [birthYear, setBirthYear] = React.useState<string>("");

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // hydrate values when user changes/open
  React.useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setRole(roleToCode(user.role));
    setPhone(user.phoneNumber ?? null);
    setGender(((user.gender as any) as GenderValue) || "Other");
    setBirthYear(
      typeof user.birthYear === "number" ? String(user.birthYear) : ""
    );
    setErr(null);
  }, [user, open]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setErr(null);
    try {
      // gộp mọi field gửi 1 lần
      await updateUser(user.userId, {
        fullName: fullName.trim(),
        role, // "ADMIN" | "STAFF" | "MEMBER"
        phoneNumber: phone ?? null,
        gender,
        birthYear: birthYear ? Number(birthYear) : null,
      });

      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="py-8 text-center text-neutral-500">No user selected.</div>
        ) : (
          <div className="space-y-4">
            {err && <div className="text-sm text-red-600">{err}</div>}

            <div>
              <label className="text-sm text-neutral-600">Full name</label>
              <Input
                className="mt-1 h-9 rounded-xl"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-neutral-600">Role</label>
              <div className="mt-1">
                <RoleSelect value={role} onChange={setRole} />
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-600">Phone number</label>
              <div className="mt-1">
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-600">Birth year</label>
                <Input
                  className="mt-1 h-9 rounded-xl"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="YYYY"
                  value={birthYear}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                    setBirthYear(v);
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Gender</label>
                <div className="mt-2">
                  <GenderRadio value={gender} onChange={setGender} />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="secondary" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={handleSave} disabled={saving || !user}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
