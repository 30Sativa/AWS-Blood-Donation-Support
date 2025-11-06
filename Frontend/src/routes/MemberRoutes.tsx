import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { BloodDonationHistory } from "@/pages/member/BloodDonationHistory";
import { RegisterDonation } from "@/pages/member/RegisterDonation";
import { HealthCheck } from "@/pages/member/HealthCheck";
import { Dashboard } from "@/pages/member/Dashboard";
import { SOS } from "@/pages/member/SOS";
import { AccountSettings } from "@/pages/member/AccountSettings";
import { Notifications } from "@/pages/member/Notifications";

export function MemberRoutes() {
  return (
    <Routes>
      <Route
        element={
          <Layout>
            <Outlet />
          </Layout>
        }
      >
        <Route index element={<Navigate to="history" replace />} />
        <Route path="history" element={<BloodDonationHistory />} />
        <Route path="register-donation" element={<RegisterDonation />} />
        <Route path="health-check" element={<HealthCheck />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="sos" element={<SOS />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
}

