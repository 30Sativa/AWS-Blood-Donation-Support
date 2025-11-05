import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage/homePage";
import Blog from "./pages/Blog/Blog";
// import ViewBlog from "./pages/ViewBlog";
import LoginPage from "./pages/LoginPage"; // nếu dùng login riêng

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Header/>

        <main className="flex-1 pt-0 ">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<Blog />} />
            {/* <Route path="/blog/:slug" element={<ViewBlog />} /> */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
