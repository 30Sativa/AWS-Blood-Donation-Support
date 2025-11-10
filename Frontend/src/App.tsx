import { RouterProvider } from "react-router-dom";
import routes from "./routes/PublicRoutes";
import { AuthProvider } from "./context/AuthContext"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const router = routes;
  return (
    <AuthProvider>
      <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
    </AuthProvider>
  );
}

export default App;