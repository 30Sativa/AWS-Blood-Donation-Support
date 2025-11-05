import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage/homePage";
import Blog from "./pages/Blog/Blog";
// import ViewBlog from "./pages/ViewBlog";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-0">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<Blog />} />
          {/* <Route path="/blog/:slug" element={<ViewBlog />} /> */}
          
          {/* Login route - redirect if already authenticated */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - require authentication */}
          {/* Example:
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          */}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
