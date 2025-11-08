import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import ManageAccounts from "@/pages/admin/ManageAccounts";
import ManageBlog from "@/pages/admin/ManageBlog";
import AccountDetails from "@/pages/admin/AccountDetails"; // <— NEW

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Default -> /admin/accounts */}
        <Route index element={<Navigate to="accounts" replace />} />

        {/* Accounts list + details */}
        <Route path="accounts" element={<ManageAccounts />} />
        <Route path="accounts/:id" element={<AccountDetails />} /> 

        {/* Others */}
        <Route path="manage-blog" element={<ManageBlog />} />
        <Route path="reports" element={<div>Reports</div>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="accounts" replace />} />
      </Route>
    </Routes>
  );
}

export { AdminRoutes };
