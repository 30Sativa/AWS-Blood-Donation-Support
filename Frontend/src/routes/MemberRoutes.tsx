import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { BloodDonationHistory } from "@/pages/member/BloodDonationHistory";
import { RegisterDonation } from "@/pages/member/RegisterDonation";
import { SOS } from "@/pages/member/SOS";
import { AccountSettings } from "@/pages/member/AccountSettings";

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
        <Route path="health-check" element={<div>Health Check</div>} />
        <Route path="notifications" element={<div>Notifications</div>} />
        <Route path="sos" element={<SOS />} />
        <Route path="dashboard" element={<div>Dashboard</div>} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
}

