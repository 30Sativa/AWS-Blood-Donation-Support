import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, MapPin } from "lucide-react";
import { requestService } from "@/services/requestService";
import type { Request } from "@/types/request";
import StatusBadge from "@/components/requests/StatusBadge";
import StatusTimeline from "@/components/requests/StatusTimeline";

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const requestId = Number(id);

  useEffect(() => {
    if (!requestId) {
      setError("Request not found");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await requestService.getRequest(requestId);
        setRequest(data);
      } catch (err: any) {
        console.error("Load request detail error:", err);
        if (err?.status === 404) {
          setError("Request not found");
        } else {
          setError(
            err?.message ||
              "Unable to load request detail. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [requestId]);

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

  const handleViewCompatibleDonors = () => {
    if (!request) return;
    navigate(`/member/requests/${request.requestId}/donors`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          Loading request detail...
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{error || "Request not found"}</p>
        </div>
      </div>
    );
  }

  const showFindDonors =
    (request.status || "").toString().toUpperCase() === "MATCHING";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-black">
              Request #{request.requestId}
            </h1>
            <p className="text-sm text-gray-600">
              Detailed information about your blood request.
            </p>
          </div>
        </div>
        <StatusBadge status={request.status} className="text-sm px-4 py-1.5" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Request Information
          </h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-gray-500">Urgency</dt>
              <dd className="font-medium">
                {formatUrgency(String(request.urgency))}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Blood Type</dt>
              <dd className="font-medium">
                {request.bloodTypeId ? `#${request.bloodTypeId}` : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Component</dt>
              <dd className="font-medium">
                {request.componentId ? `#${request.componentId}` : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Quantity</dt>
              <dd className="font-medium">
                {request.quantityUnits} units
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Need Before</dt>
              <dd className="font-medium">
                {formatDateTime(request.needBeforeUtc)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created At</dt>
              <dd className="font-medium">
                {formatDateTime(request.createdAt)}
              </dd>
            </div>
            {request.updatedAt && (
              <div>
                <dt className="text-gray-500">Updated At</dt>
                <dd className="font-medium">
                  {formatDateTime(request.updatedAt)}
                </dd>
              </div>
            )}
            <div className="md:col-span-2">
              <dt className="text-gray-500">Clinical Notes</dt>
              <dd className="mt-1 whitespace-pre-line rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                {request.clinicalNotes || "N/A"}
              </dd>
            </div>
          </dl>

          {showFindDonors && (
            <div className="pt-4">
              <button
                type="button"
                onClick={handleViewCompatibleDonors}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Find Compatible Donors
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Status Timeline</h2>
          <StatusTimeline status={request.status} createdAt={request.createdAt} />

          <div className="space-y-3 border-t border-gray-200 pt-4 text-sm">
            <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            {request.deliveryAddressId && (
              <p className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-gray-500" />
                Address ID: {request.deliveryAddressId}
              </p>
            )}
            {request.deliveryAddress && (
              <p className="text-gray-700">{request.deliveryAddress}</p>
            )}
            {!request.deliveryAddress && !request.deliveryAddressId && (
              <p className="text-gray-500 text-xs">
                Delivery address details are not available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


