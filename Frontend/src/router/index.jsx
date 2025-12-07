import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicRoute from "../guards/PublicRoute";
import PrivateRoute from "../guards/PrivateRoute";
import AdminRoute from "../guards/AdminRoute";
import StaffRoute from "../guards/StaffRoute";
import MemberRoute from "../guards/MemberRoute";
import Layout from "../components/layout/Layout";
import HomePage from "../pages/HomePage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ConfirmEmail from "../pages/auth/ConfirmEmail";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import StaffDashboard from "../pages/dashboard/StaffDashboard";
import MemberDashboard from "../pages/dashboard/MemberDashboard";
import MemberProfile from "../pages/dashboard/MemberProfile";
import MemberDonor from "../pages/dashboard/MemberDonor";
import RegisterDonor from "../pages/dashboard/RegisterDonor";
import EditDonor from "../pages/dashboard/EditDonor";
import NearbyDonors from "../pages/dashboard/NearbyDonors";
import ManageDonors from "../pages/dashboard/ManageDonors";
import DefaultRedirect from "./DefaultRedirect";
import RequestList from "../pages/requests/RequestList";
import RequestDetail from "../pages/requests/RequestDetail";
import NewRequest from "../pages/requests/NewRequest";
import MatchList from "../pages/matches/MatchList";
import MatchDetail from "../pages/matches/MatchDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/confirm-email",
    element: (
      <PublicRoute>
        <ConfirmEmail />
      </PublicRoute>
    ),
  },

  // ========= DASHBOARD (PRIVATE) =============
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <DefaultRedirect /> },

      // Admin: /dashboard/admin
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },

      // Staff: /dashboard/staff
      {
        path: "staff",
        element: (
          <StaffRoute>
            <StaffDashboard />
          </StaffRoute>
        ),
      },

      // Member: /dashboard/member
      {
        path: "member",
        element: (
          <MemberRoute>
            <MemberDashboard />
          </MemberRoute>
        ),
      },
      {
        path: "member/dashboard",
        element: (
          <MemberRoute>
            <MemberDashboard />
          </MemberRoute>
        ),
      },
      {
        path: "member/profile",
        element: (
          <MemberRoute>
            <MemberProfile />
          </MemberRoute>
        ),
      },
      {
        path: "member/donor",
        element: (
          <MemberRoute>
            <MemberDonor />
          </MemberRoute>
        ),
      },
      {
        path: "member/register-donor",
        element: (
          <MemberRoute>
            <RegisterDonor />
          </MemberRoute>
        ),
      },
      {
        path: "member/edit-donor",
        element: (
          <MemberRoute>
            <EditDonor />
          </MemberRoute>
        ),
      },
      {
        path: "staff/nearby-donors",
        element: (
          <StaffRoute>
            <NearbyDonors />
          </StaffRoute>
        ),
      },
      {
        path: "staff/donors",
        element: (
          <StaffRoute>
            <ManageDonors />
          </StaffRoute>
        ),
      },
      {
        path: "member/requests",
        element: (
          <MemberRoute>
            <RequestList />
          </MemberRoute>
        ),
      },
      {
        path: "member/requests/new",
        element: (
          <MemberRoute>
            <NewRequest />
          </MemberRoute>
        ),
      },

      // Common pages
      { path: "requests", element: <RequestList /> },
      { path: "requests/:id", element: <RequestDetail /> },

      { path: "matches", element: <MatchList /> },
      { path: "matches/:id", element: <MatchDetail /> },
    ],
  },
]);

export default router;
