import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicRoutes } from "./routes/PublicRoutes";
import { MemberRoutes } from "./routes/MemberRoutes";

function App() {
  return (

    <BrowserRouter>
      <Routes>
        {/* Public routes (Home, Blog, etc.) */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* Member routes */}
        <Route path="/member/*" element={<MemberRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
