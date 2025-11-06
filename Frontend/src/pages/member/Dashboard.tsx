import {
  Trophy,
  Droplet,
  CheckCircle2,
  Bell,
  Heart,
  Calendar,
  Clock,
  DollarSign,
  X,
  HeartHandshake,
  Users,
  Plus,
} from "lucide-react";

interface Metric {
  id: string;
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  secondaryIcon: React.ComponentType<{ className?: string }>;
  secondaryIconColor: string;
}

interface RecentActivity {
  id: string;
  type: "DONATION" | "SOS REQUEST";
  location: string;
  date: string;
  status: "Completed" | "Pending" | "Cancelled";
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const metrics: Metric[] = [
  {
    id: "1",
    title: "Total Donations",
    value: "5",
    icon: Trophy,
    iconColor: "text-yellow-500",
    secondaryIcon: Plus,
    secondaryIconColor: "text-red-600",
  },
  {
    id: "2",
    title: "Total Blood Donated",
    value: "1000ml",
    icon: Droplet,
    iconColor: "text-red-600",
    secondaryIcon: Droplet,
    secondaryIconColor: "text-red-600",
  },
  {
    id: "3",
    title: "Lives Saved",
    value: "35",
    icon: CheckCircle2,
    iconColor: "text-blue-500",
    secondaryIcon: Users,
    secondaryIconColor: "text-blue-500",
  },
  {
    id: "4",
    title: "New Notifications",
    value: "5",
    icon: Bell,
    iconColor: "text-green-500",
    secondaryIcon: Bell,
    secondaryIconColor: "text-green-500",
  },
];

const upcomingAppointment = {
  hospital: "Cho Ray Hopital",
  time: "8pm",
  status: "Confirmed",
};

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "DONATION",
    location: "Cho Ray Hopital",
    date: "25/01/2025",
    status: "Completed",
    icon: Heart,
    iconColor: "text-red-600",
  },
  {
    id: "2",
    type: "SOS REQUEST",
    location: "Cho Ray Hopital",
    date: "25/01/2025",
    status: "Completed",
    icon: X,
    iconColor: "text-red-600",
  },
];

const achievements: Achievement[] = [
  {
    id: "1",
    title: "Dedicated Donor",
    description: "Donated 4 times",
    icon: HeartHandshake,
  },
  {
    id: "2",
    title: "Dedicated Donor",
    description: "Donated 4 times",
    icon: HeartHandshake,
  },
];

export function Dashboard() {
  return (
    <>
      <style>{`
        @keyframes slow-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-slow-pulse {
          animation: slow-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-8">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your blood donation activities
          </p>
        </div>

        {/* Health Status */}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-green-600 mb-4 text-center">
            Health Status
          </h1>
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-3">
            <Heart className="w-12 h-12 text-white fill-white animate-slow-pulse" />
          </div>
          <span className="text-2xl font-bold text-green-600 text-center">Eligible</span>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const MainIcon = metric.icon;
          const SecondaryIcon = metric.secondaryIcon;
          return (
            <div
              key={metric.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
                             <div className="flex items-start justify-between mb-4 relative">
                 <MainIcon className={`w-8 h-8 ${metric.iconColor} animate-slow-pulse`} />
                 {metric.id === "1" ? (
                   <div className="relative">
                     <Heart className={`w-5 h-5 ${metric.secondaryIconColor} fill-current animate-slow-pulse`} />
                     <Plus className="w-3 h-3 text-white absolute top-0 left-0" />
                   </div>
                 ) : (
                   <SecondaryIcon
                     className={`w-5 h-5 ${metric.secondaryIconColor} animate-slow-pulse`}
                   />
                 )}
               </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {metric.value}
              </div>
              <p className="text-sm text-gray-600">{metric.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">
              Upcoming Appointment
            </h2>
          </div>
          <div className="border-2 border-pink-200 bg-pink-50 rounded-lg p-4 mb-4">
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
              {upcomingAppointment.status}
            </span>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {upcomingAppointment.hospital}
            </p>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{upcomingAppointment.time}</span>
            </div>
          </div>
          <a
            href="#"
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Show more
          </a>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activities
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-blue-500"
                >
                  <div className="flex items-center gap-4">
                    <ActivityIcon
                      className={`w-6 h-6 ${activity.iconColor}`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {activity.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.location}
                      </p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {activity.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const AchievementIcon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 hover:shadow-md hover:border-red-200 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AchievementIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}