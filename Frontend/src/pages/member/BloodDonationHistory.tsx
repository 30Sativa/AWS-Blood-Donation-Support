import { Heart, Droplet, Award, Calendar } from "lucide-react";

interface DonationRecord {
  code: string;
  donationDay: string;
  location: string;
  bloodVolume: string;
  status: "Success" | "Pending" | "Failed";
}

const mockDonations: DonationRecord[] = [
  {
    code: "DON001",
    donationDay: "17/12/2022",
    location: "Hopital Cho Ray",
    bloodVolume: "350ml",
    status: "Success",
  },
  {
    code: "DON002",
    donationDay: "1/2/2023",
    location: "Hopital Ung Buou",
    bloodVolume: "350ml",
    status: "Success",
  },
  {
    code: "DON003",
    donationDay: "1/7/2023",
    location: "Hopital Ung Buou",
    bloodVolume: "300ml",
    status: "Success",
  },
];

const stats = {
  totalDonations: 4,
  totalBloodDonated: 1500,
  peopleSaved: 6,
  nextDonation: "25/10",
};

export function BloodDonationHistory() {
  return (
    <div className="space-y-8">
      {/* Blood donation history section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Blood donation history</h1>
          <p className="text-gray-600 mt-1">Review your blood donations</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Donations Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Heart className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.totalDonations}
            </div>
            <p className="text-sm text-gray-600">total number of times</p>
          </div>

          {/* Total Blood Donated Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Droplet className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.totalBloodDonated.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">ml blood</p>
          </div>

          {/* People Saved Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Award className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.peopleSaved}
            </div>
            <p className="text-sm text-gray-600">total people saved</p>
          </div>

          {/* Next Donation Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Calendar className="w-8 h-8 text-red-600 mb-4" />
            <div className="text-4xl font-bold text-red-600 mb-2">
              {stats.nextDonation}
            </div>
            <p className="text-sm text-gray-600">next time</p>
          </div>
        </div>
      </div>

      {/* Historical details section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-black">Historical details</h2>
          <p className="text-gray-600 mt-1">List of completed blood donations</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Donation day
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Blood volume
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockDonations.map((donation, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.donationDay}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {donation.bloodVolume}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          donation.status === "Success"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.status}
                      </span>
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

