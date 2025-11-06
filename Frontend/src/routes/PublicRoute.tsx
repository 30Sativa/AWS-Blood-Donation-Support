import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../components/MainLayout";
import AuthLayout from "../components/AuthLayout";

import HomePage from "../pages/Homepage/homePage";
import LoginPage from "../pages/LoginPage";

import AdminPage from "../pages/Admin/test";
import StaffPage from "../pages/Staff/test";
import MemberPage from "../pages/Member/test";

import ProtectedRoute from "./PrivateRoute";
import Blog from "@/pages/Blog/Blog";

const routes = createBrowserRouter([ // test
  {
    path: "/",
    element: <MainLayout />, // layout có header footer
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
  {
    path: "/auth",   // layout không có header footer
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      {path: "register", element: <LoginPage/>}
    ],
  },
  {
    path: "/member",  // chuyển hướng các role
    element: (
      <ProtectedRoute allowedRoles={["member", "staff", "admin"]}>
        <MemberPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute allowedRoles={["staff", "admin"]}>
        <StaffPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
]);

export default routes;
