// src/pages/admin/components/PhoneInput.tsx
import * as React from "react";
import { Input } from "@/components/ui/input";

function groupVN(local: string) {
  const s = local.replace(/\D/g, "");
  if (s.length <= 3) return s;
  const parts = s.match(/.{1,3}/g) ?? [s];
  return parts.join(" ");
}

/** Hiển thị prefix 🇻🇳 +84, lưu/emit dạng chuẩn +84xxxxxxxxx */
export default function PhoneInput({
  value,
  onChange,
  disabled,
}: {
  value?: string | null;
  onChange: (e164: string | null) => void;
  disabled?: boolean;
}) {
  // parse giá trị đầu vào
  const compact = (value ?? "").replace(/[^\d+]/g, "");
  let local = compact;
  if (compact.startsWith("+84")) local = compact.slice(3);
  else if (compact.startsWith("84")) local = compact.slice(2);
  if (local.startsWith("0")) local = local.slice(1);
  const display = groupVN(local);

  return (
    <div className="flex items-stretch rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
      <span className="px-3 flex items-center text-xs text-neutral-700 bg-white border-r border-neutral-200 select-none">
        🇻🇳 +84
      </span>
      <Input
        disabled={disabled}
        className="h-9 rounded-none border-0 bg-transparent"
        placeholder="xxx xxx xxx"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          if (!raw) {
            onChange(null);
            return;
          }
          onChange("+84" + raw.replace(/^0+/, "")); // emit E.164
        }}
      />
    </div>
  );
}
