import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createUser, DEFAULT_PASSWORD, type CreateUserPayload } from "@/services/userService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => Promise<void> | void; // gọi reload list ở trang cha
};

const emptyForm: CreateUserPayload = {
  fullName: "",
  email: "",
  role: "MEMBER",
  isActive: true,
  password: DEFAULT_PASSWORD,
};

export default function NewUserDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = React.useState<CreateUserPayload>(emptyForm);
  const [useCustomPw, setUseCustomPw] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      // reset state mỗi lần mở
      setForm(emptyForm);
      setUseCustomPw(false);
      setErr(null);
    }
  }, [open]);

  const onChange = <K extends keyof CreateUserPayload>(k: K, v: CreateUserPayload[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const fullName = (form.fullName ?? "").trim();
    const email = (form.email ?? "").trim();

    if (!fullName) return setErr("Full name is required.");
    if (!email) return setErr("Email is required.");

    try {
      setBusy(true);
      await createUser({
        ...form,
        password: useCustomPw ? form.password : DEFAULT_PASSWORD,
      });
      onOpenChange(false);
      await onCreated?.();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to create user.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new user</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nu-fullname">Full name</Label>
            <Input
              id="nu-fullname"
              value={form.fullName ?? ""}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nu-email">Email</Label>
            <Input
              id="nu-email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Label className="min-w-16">Role</Label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => onChange("role", e.target.value as any)}
            >
              <option value="MEMBER">Member</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
              <option value="GUEST">Guest</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="nu-active"
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => onChange("isActive", e.target.checked)}
            />
            <Label htmlFor="nu-active">Active</Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="nu-custompw"
              type="checkbox"
              checked={useCustomPw}
              onChange={(e) => setUseCustomPw(e.target.checked)}
            />
            <Label htmlFor="nu-custompw">Use custom password</Label>
          </div>

          {useCustomPw ? (
            <div className="space-y-2">
              <Label htmlFor="nu-password">Password</Label>
              <Input
                id="nu-password"
                type="password"
                value={form.password ?? ""}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="Enter a strong password"
                autoComplete="new-password"
              />
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Default password will be used:&nbsp;
              <span className="font-mono">{DEFAULT_PASSWORD}</span>
            </p>
          )}

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
