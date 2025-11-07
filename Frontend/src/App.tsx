import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./routes/PublicRoutes";
import { MemberRoutes } from "./routes/MemberRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (Home, Blog, etc.) */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* Member routes */}
        <Route path="/member/*" element={<MemberRoutes />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
