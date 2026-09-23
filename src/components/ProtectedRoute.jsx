import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Avvolge una pagina che deve essere visibile SOLO a chi è loggato.
 * Uso: <ProtectedRoute><Home /></ProtectedRoute> (vedi App.jsx)
 */
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if(!currentUser.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}

export default ProtectedRoute;
