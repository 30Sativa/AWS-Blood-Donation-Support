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


    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">
        Hello Tailwind + React + TypeScript 💙
      </h1>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Click Me
      </button>
      

    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button className="text-blue-400 border border-blue-400 px-4 py-2 rounded-lg">Click me</Button>


    </div>

  );
}

export default App;
