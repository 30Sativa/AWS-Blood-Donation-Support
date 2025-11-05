import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import ManageBlog from "@/pages/admin/ManageBlog";

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="manage-blog" replace />} />
        <Route path="manage-blog" element={<ManageBlog />} />
        <Route path="accounts" element={<div>Manage Accounts</div>} />
        <Route path="reports" element={<div>Reports</div>} />
      </Route>
    </Routes>
  );
}
export default AdminRoutes;
