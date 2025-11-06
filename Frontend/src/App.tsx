import { RouterProvider } from "react-router-dom";
import routes from "./routes/PublicRoute";
// 1. Import AuthProvider từ đường dẫn bạn vừa tạo
import { AuthProvider } from "./context/AuthContext"; 

function App() {
  const router = routes;
  return (
    // 2. Bọc toàn bộ RouterProvider bằng AuthProvider
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;