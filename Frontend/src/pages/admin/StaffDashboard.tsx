// src/pages/admin/StaffDashboard.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Droplet,
  AlertCircle,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  trend?: string;
}

function MetricCard({ title, value, icon: Icon, iconColor, trend }: MetricCardProps) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconColor} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  time: string;
  status: "pending" | "completed" | "in-progress";
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "Blood Request",
    description: "New request from Member #123",
    time: "2 hours ago",
    status: "pending",
  },
  {
    id: "2",
    type: "Donation",
    description: "Donation completed at Location A",
    time: "5 hours ago",
    status: "completed",
  },
  {
    id: "3",
    type: "Match",
    description: "Donor matched with Request #17",
    time: "1 day ago",
    status: "completed",
  },
];

function StatusBadge({ status }: { status: ActivityItem["status"] }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </span>
  );
}

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of blood donation system operations and activities
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value="1,234"
          icon={Users}
          iconColor="text-blue-600"
          trend="+12% this month"
        />
        <MetricCard
          title="Active Requests"
          value="45"
          icon={AlertCircle}
          iconColor="text-red-600"
          trend="+5 new today"
        />
        <MetricCard
          title="Total Donations"
          value="892"
          icon={Droplet}
          iconColor="text-green-600"
          trend="+23 this week"
        />
        <MetricCard
          title="Pending Matches"
          value="12"
          icon={CheckCircle2}
          iconColor="text-yellow-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 rounded-xl border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Recent Activities
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Latest system activities and updates
                </p>
              </div>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{activity.type}</p>
                      <StatusBadge status={activity.status} />
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activities →
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Quick Actions
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Common tasks and shortcuts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and edit user accounts</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Review Requests</p>
                  <p className="text-xs text-gray-500">Process blood requests</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Manage Blog</p>
                  <p className="text-xs text-gray-500">Edit blog posts</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-xs text-gray-500">System reports and analytics</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              This Week's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Requests</span>
                <span className="font-semibold text-gray-900">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Donations</span>
                <span className="font-semibold text-gray-900">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Matches Created</span>
                <span className="font-semibold text-gray-900">18</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Health</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Connected
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

