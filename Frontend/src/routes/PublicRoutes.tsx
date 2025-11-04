import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import HomePage from "@/pages/Homepage/homePage";
import Blog from "@/pages/Blog/Blog";
import LoginPage from "@/pages/LoginPage";
// import ViewBlog from "@/pages/ViewBlog";

export function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="blog" element={<Blog />} />
        <Route path="login" element={<LoginPage />} />
        {/* <Route path="blog/:slug" element={<ViewBlog />} /> */}
      </Route>
    </Routes>
  );
}

