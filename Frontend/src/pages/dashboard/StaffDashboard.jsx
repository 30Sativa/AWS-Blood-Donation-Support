export default function StaffDashboard() {
  const stats = [
    {
      title: "Pending Requests",
      value: "5",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Active Donors",
      value: "24",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Completed Matches",
      value: "12",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Today's Appointments",
      value: "8",
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistical Report Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1.5">
            Statistical Report
          </h2>
          <p className="text-gray-600 text-sm">Staff activity overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl shadow-sm`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
              <div className="text-gray-600 text-sm font-medium mb-2">
                {stat.title}
              </div>
              <div className={`${stat.color} text-3xl font-bold leading-none`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-600">Requests processed today:</span>
            <span className="font-semibold text-gray-900">3</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-600">New donor registrations:</span>
            <span className="font-semibold text-gray-900">2</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Pending approvals:</span>
            <span className="font-semibold text-gray-900">5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
