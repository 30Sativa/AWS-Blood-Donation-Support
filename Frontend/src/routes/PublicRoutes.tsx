// fileName: PublicRoutes.tsx (ĐÃ SỬA LỖI HOÀN TOÀN)

// ⭐️ ĐÃ THÊM: Navigate và Outlet (cần thiết cho Route Object)
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

// Components & Layouts Public
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
import HomePage from "@/pages/Homepage/HomePage";
import LoginPage from "../pages/LoginPage";
import Blog from "@/pages/Blog/Blog";
import Forgotpassword from "@/components/Forgotpassword/Forgotpassword";
import ConfirmEmail from "@/pages/ConfirmEmail";

// Components & Layouts Protected
import ProtectedRoute from "./PrivateRoutes"; 
import { Layout } from "@/components/layout/Layout"; // Layout chung cho cả Member và Admin
// Member Pages
import { BloodDonationHistory } from "@/pages/member/BloodDonationHistory";
import { RegisterDonor } from "@/pages/member/RegisterDonor";
import { HealthCheck } from "@/pages/member/HealthCheck";
import { Dashboard } from "@/pages/member/Dashboard";
import { SOS } from "@/pages/member/SOS";
import { AccountSettings } from "@/pages/member/AccountSettings";
import { DonorProfile } from "@/pages/member/DonorProfile";
import { Notifications } from "@/pages/member/Notifications";
// Admin Pages
import ManageAccounts from "@/pages/admin/ManageAccounts";
import ManageBlog from "@/pages/admin/ManageBlog";

const routes = createBrowserRouter([
  // --- 1. ROUTES CHUNG (PUBLIC) ---
  {
    path: "/",
    element: <MainLayout />, 
    children: [
    {
      index:true,
      element: <HomePage/>,
    },
    {
      path:"/blog",
      element: <Blog/>
    }
    ],
  },
  // --- 2. ROUTES XÁC THỰC (AUTH) ---
  {
    path: "/auth",   
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      {path: "register", element: <LoginPage/>}
    ],
  },
  // --- 2.1. ROUTE FORGOT PASSWORD ---
  {
    path: "/forgot-password",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Forgotpassword /> }
    ],
  },
  // --- 2.2. ROUTE CONFIRM EMAIL ---
  {
    path: "/confirm-email",
    element: <AuthLayout />,
    children: [
      { index: true, element: <ConfirmEmail /> }
    ],
  },
  
  // --- 3. ROUTES MEMBER (Chính xác) ---
  {
    path: "/member",
    element: (
      <ProtectedRoute allowedRoles={["member", "staff", "admin"]}>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "history", element: <BloodDonationHistory /> },
      { path: "register-donor", element: <RegisterDonor /> },
      { path: "donor-profile", element: <DonorProfile /> },
      { path: "health-check", element: <HealthCheck /> },
      { path: "notifications", element: <Notifications /> },
      { path: "sos", element: <SOS /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "settings", element: <AccountSettings /> },
      { path: "*", element: <Navigate to="dashboard" replace /> },
    ],
  },

  // --- 4. ROUTES ADMIN (⭐️ ĐÃ SỬA LỖI) ---
  {
  path: "/admin",
  element: (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="accounts" replace /> },
    { path: "accounts", element: <ManageAccounts /> },
    { path: "manage-blog", element: <ManageBlog /> },
    { path: "reports", element: <div>Reports</div> }, 
    { path: "*", element: <Navigate to="accounts" replace /> },
  ],
},
]);

export default routes;