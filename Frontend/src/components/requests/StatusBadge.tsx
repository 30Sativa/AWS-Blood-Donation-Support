import React from "react";
import type { RequestStatus } from "@/types/request";

interface StatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "bg-gray-100 text-gray-800",
  MATCHING: "bg-blue-100 text-blue-800",
  FULFILLED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const upper = (status || "").toString().toUpperCase();
  const base = STATUS_STYLES[upper] ?? "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${base} ${className}`}
    >
      {upper}
    </span>
  );
};

export default StatusBadge;


