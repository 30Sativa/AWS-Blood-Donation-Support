import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, User } from "lucide-react";
import { requestService } from "@/services/requestService";
import type { CompatibleDonor } from "@/types/request";

export function CompatibleDonors() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [donors, setDonors] = useState<CompatibleDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);

  const requestId = Number(id);

  useEffect(() => {
    if (!requestId) {
      setError("Invalid request id.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await requestService.getCompatibleDonors(requestId);
        setDonors(data);
      } catch (err: any) {
        console.error("Load compatible donors error:", err);
        setError(
          err?.message ||
            "Unable to load compatible donors. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [requestId]);

  const handleSelect = async (donorId: number) => {
    if (!requestId) return;
    const confirmed = window.confirm(
      "Create a match between this donor and your request?"
    );
    if (!confirmed) return;

    try {
      setSelectedDonorId(donorId);
      await requestService.createMatch(requestId, { donorId });
      alert("Match created successfully.");
      navigate(`/member/requests/${requestId}`);
    } catch (err: any) {
      console.error("Create match error:", err);
      alert(
        err?.message || "Unable to create match. Please try again later."
      );
    } finally {
      setSelectedDonorId(null);
    }
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
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading compatible donors...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              Compatible Donors for Request #{requestId}
            </h1>
            <p className="text-sm text-gray-600">
              Select a donor to create a match for this request.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {donors.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <User className="h-10 w-10 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            No compatible donors found yet.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please check again later or contact the support staff.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {donors.map((donor) => (
            <div
              key={donor.donorId}
              className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-gray-900">
                    {donor.fullName}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Blood Group</span>
                  <span className="font-medium">{donor.bloodGroup}</span>
                </div>
                {donor.distanceKm !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Distance</span>
                    <span className="font-medium">
                      {donor.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                )}
                {donor.availability && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium">{donor.availability}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSelect(donor.donorId)}
                  disabled={selectedDonorId === donor.donorId}
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {selectedDonorId === donor.donorId && (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  )}
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


