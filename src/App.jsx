import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";
import Genre from "./pages/Genre.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Le rotte dentro ProtectedRoute sono visibili solo a chi è loggato */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/show/:id"
        element={
          <ProtectedRoute>
            <ShowDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/genre/:id"
        element={
          <ProtectedRoute>
            <Genre />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;