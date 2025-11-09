import { RouterProvider } from "react-router-dom";
import routes from "./routes/PublicRoutes";
import { AuthProvider } from "./context/AuthContext"; 

function App() {
  const router = routes;
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;