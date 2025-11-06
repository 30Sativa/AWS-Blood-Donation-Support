import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Calendar, Heart, AlertCircle, ChevronDown, Filter, Search } from "lucide-react";

interface Notification {
  id: string;
  type: "reminder" | "thank_you" | "emergency" | "system";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "reminder",
    title: "Reminder: Upcoming Blood Donation (New)",
    description: "You have a blood donation appointment on 25/10/2025 at 09:00 at Cho Ray Hospital.",
    timestamp: "1 hour ago",
    isRead: false,
    icon: Calendar,
    iconColor: "text-orange-500",
  },
  {
    id: "2",
    type: "thank_you",
    title: "Thank You for Donating Blood (New)",
    description: "Your blood donation has helped save the lives of patients.",
    timestamp: "2 hour ago",
    isRead: false,
    icon: Heart,
    iconColor: "text-red-500",
  },
  {
    id: "3",
    type: "emergency",
    title: "Emergency Blood Request",
    description: "Blood type A+ needed at Children's Hospital 1 (Nhi Đồng 1).",
    timestamp: "3 hour ago",
    isRead: true,
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  {
    id: "4",
    type: "emergency",
    title: "Emergency Blood Request",
    description: "Blood type O- urgently needed at Bach Mai Hospital.",
    timestamp: "5 hour ago",
    isRead: true,
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  {
    id: "5",
    type: "system",
    title: "Account Update",
    description: "Your profile information has been updated successfully.",
    timestamp: "1 day ago",
    isRead: true,
    icon: Calendar,
    iconColor: "text-blue-500",
  },
];

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || notif.type === filterType;

    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Notifications</h1>
          <p className="text-gray-600 mt-1">Important alerts and reminders</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            className="bg-red-600 text-white hover:bg-red-700 text-sm px-4 py-2"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search info..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-40 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
          >
            <option value="all">All</option>
            <option value="reminder">Reminder</option>
            <option value="thank_you">Thank You</option>
            <option value="emergency">Emergency</option>
            <option value="system">System</option>
          </Select>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 px-4"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            const bgColor = notification.isRead
              ? "bg-white"
              : "bg-red-50 border-red-200";

            return (
              <div
                key={notification.id}
                className={`border rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 ${bgColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${notification.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                          {notification.description}
                        </p>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>

                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium whitespace-nowrap transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

