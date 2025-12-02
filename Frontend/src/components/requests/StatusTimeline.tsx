import React from "react";
import type { RequestStatus } from "@/types/request";

interface StatusTimelineProps {
  status: RequestStatus | string;
  createdAt?: string;
}

const steps: RequestStatus[] = ["REQUESTED", "MATCHING", "FULFILLED"];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  status,
  createdAt,
}) => {
  const current = (status || "").toString().toUpperCase();
  const isCancelled = current === "CANCELLED";

  return (
    <ol className="relative ml-2 border-l border-gray-200 text-sm">
      {steps.map((step, index) => {
        const stepUpper = step.toString().toUpperCase();
        const reached =
          !isCancelled && steps.indexOf(step) <= steps.indexOf(current as any);
        const baseColor =
          stepUpper === "REQUESTED"
            ? "bg-gray-400"
            : stepUpper === "MATCHING"
            ? "bg-blue-400"
            : "bg-green-500";

        return (
          <li key={stepUpper} className={index < steps.length - 1 ? "mb-6 ml-4" : "ml-4"}>
            <div
              className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white ${
                reached ? baseColor : "bg-gray-300"
              }`}
            />
            {index === 0 && createdAt && (
              <time className="mb-1 text-xs font-normal text-gray-500">
                {new Date(createdAt).toLocaleString()}
              </time>
            )}
            <p className="text-sm font-semibold text-gray-900">{stepUpper}</p>
            {stepUpper === "REQUESTED" && (
              <p className="text-xs text-gray-500">
                Your request was created and sent to the system.
              </p>
            )}
            {stepUpper === "MATCHING" && (
              <p className="text-xs text-gray-500">
                The system is searching for compatible donors.
              </p>
            )}
            {stepUpper === "FULFILLED" && (
              <p className="text-xs text-gray-500">
                The request has been fulfilled and blood has been provided.
              </p>
            )}
          </li>
        );
      })}

      {isCancelled && (
        <li className="mt-4 ml-4">
          <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-red-500" />
          <p className="text-sm font-semibold text-red-700">CANCELLED</p>
          <p className="text-xs text-red-500">
            This request has been cancelled. No further matching will occur.
          </p>
        </li>
      )}
    </ol>
  );
};

export default StatusTimeline;


