import { Heart } from "lucide-react";

interface HealthCheckRecord {
  date: string;
  location: string;
  result: "Eligible" | "Deferred";
  notes: string;
}

const mockHealthChecks: HealthCheckRecord[] = [
  {
    date: "15/09/2025",
    location: "National Blood Center",
    result: "Eligible",
    notes: "Normal",
  },
  {
    date: "20/03/2025",
    location: "Hematology Hospital",
    result: "Deferred",
    notes: "Low BP",
  },
];

const currentStatus = {
  isEligible: true,
  message: "You are eligible to donate blood now!",
};

export function HealthCheck() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Health Check</h1>
        <p className="text-gray-600 mt-1">Check your eligibility for blood donation</p>
      </div>

      {/* Current Status and Eligibility Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Status</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Heart className="w-20 h-20 text-green-500 mb-4 fill-green-500" />
            <div className="text-3xl font-bold text-green-600 mb-2">
              {currentStatus.isEligible ? "Eligible" : "Deferred"}
            </div>
            <p className="text-sm text-gray-700 text-center mt-2">
              {currentStatus.message}
            </p>
          </div>
        </div>

        {/* Eligibility Notes Card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Blood Donation Eligibility Notes
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Blood Pressure:
              </p>
              <p className="text-sm text-gray-600">90-140 / 60-90 mmHg</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Weight:
              </p>
              <p className="text-sm text-gray-600">≥ 45 kg</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Hemoglobin:
              </p>
              <p className="text-sm text-gray-600">
                Male ≥ 12.5 g/dL, Female ≥ 12.0 g/dL
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Age:
              </p>
              <p className="text-sm text-gray-600">18-60 years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Check History */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Health Check History</h2>
          <p className="text-gray-600 mt-1">Your past health check records</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Result
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockHealthChecks.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          record.result === "Eligible"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}