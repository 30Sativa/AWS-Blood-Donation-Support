import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { requestService } from "@/services/requestService";
import type { Request } from "@/types/request";
import StatusBadge from "@/components/requests/StatusBadge";

export function MyRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await requestService.getMyRequests();
        setRequests(data);
      } catch (err: any) {
        console.error("Load my requests error:", err);
        setError(
          err?.message ||
            "Unable to load your blood requests. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const formatUrgency = (u: string) => {
    if (!u) return "-";
    const normalized = u.toLowerCase();
    if (normalized === "low") return "Low";
    if (normalized === "normal") return "Normal";
    if (normalized === "high") return "High";
    return u;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black">My Blood Requests</h1>
          <p className="text-gray-600 mt-1">
            View and manage your blood requests.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="flex justify-end">
                <div className="h-8 w-24 bg-gray-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">My Blood Requests</h1>
          <p className="text-gray-600 mt-1">
            View and track your submitted blood requests.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {requests.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <FileText className="h-10 w-10 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            You have no blood requests yet.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            When you create a new request, it will appear here for tracking.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Blood Type</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Need Before</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((request) => (
                <tr key={request.requestId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {request.requestId}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {request.bloodTypeId ? `#${request.bloodTypeId}` : "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {request.componentId ? `#${request.componentId}` : "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {request.quantityUnits}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatUrgency(String(request.urgency))}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatDateTime(request.needBeforeUtc)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatDateTime(request.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/member/requests/${request.requestId}`)
                      }
                      className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    >
                      View detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


