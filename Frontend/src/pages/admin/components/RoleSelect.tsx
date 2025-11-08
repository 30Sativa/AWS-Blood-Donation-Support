// src/pages/admin/components/RoleSelect.tsx
import React from "react";

export type RoleCode = "MEMBER" | "STAFF" | "ADMIN";

type Props = {
  value: RoleCode;
  onChange: (v: RoleCode) => void;
  disabled?: boolean;
  className?: string;
};

const OPTIONS: Array<{ label: string; value: RoleCode }> = [
  { label: "Member", value: "MEMBER" },
  { label: "Staff",  value: "STAFF"  },
  { label: "Admin",  value: "ADMIN"  },
];

export default function RoleSelect({
  value,
  onChange,
  disabled = false,
  className,
}: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* icon mũi tên đơn giản */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5" />
        </svg>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RoleCode)}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-8 text-sm
          focus:outline-none focus:ring-2 focus:ring-neutral-200
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
