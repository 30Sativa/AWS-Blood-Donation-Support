
import LoginPage from "./pages/LoginPage";

function App() {
  return <LoginPage />;


import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Blog from "./pages/Blog/Blog";
// import ViewBlog from "./pages/ViewBlog";



function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">

        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<div className="p-8">Home Page</div>} />
            <Route path="/blog" element={<Blog />} />
            {/* <Route path="/blog/:slug" element={<ViewBlog />} />            */}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter> 

import HomePage from "./pages/Homepage/homePage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">     
      <main className="pt-0 -mt-[4rem]">
          <HomePage/>
      </main>
    </div>

  );
}

export default App;