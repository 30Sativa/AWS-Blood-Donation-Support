// src/pages/admin/components/GenderRadio.tsx
import React from "react";

export type GenderValue = "Male" | "Female" | "Other";

type Props = {
  value?: GenderValue;
  onChange?: (v: GenderValue) => void;
  disabled?: boolean;
  className?: string;
};

export default function GenderRadio({
  value,
  onChange,
  disabled = false,
  className,
}: Props) {
  const opts: GenderValue[] = ["Male", "Female", "Other"];

  return (
    <div
      className={`flex flex-wrap gap-4 ${className ?? ""} ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      role="radiogroup"
      aria-label="Gender"
    >
      {opts.map((opt) => {
        const id = `gender-${opt}`;
        return (
          <label key={opt} htmlFor={id} className="flex items-center gap-2 cursor-pointer">
            <input
              id={id}
              type="radio"
              name="gender"
              value={opt}
              checked={value === opt}
              onChange={() => onChange?.(opt)}
              className="h-4 w-4"
              disabled={disabled}
            />
            <span className="text-sm">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}
