import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";
import Genre from "./pages/Genre.jsx";
import Provider from "./pages/Provider.jsx";
import SeasonDetail from "./pages/SeasonDetail.jsx";
import EpisodeDetail from "./pages/EpisodeDetail.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import Library from "./pages/Library.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Tutte le rotte qui dentro sono protette E condividono lo stesso
          "guscio" (topbar con ricerca + menu in basso), grazie alle rotte
          annidate di react-router: AppLayout renderizza <Outlet /> dove
          va la pagina specifica. */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/show/:mediaType/:id" element={<ShowDetail />} />
        <Route path="/genre/:id" element={<Genre />} />
        <Route path="/provider/:id" element={<Provider />} />
        <Route
          path="/show/:showId/season/:seasonNumber"
          element={<SeasonDetail />}
        />
        <Route
          path="/show/:showId/season/:seasonNumber/episode/:episodeNumber"
          element={<EpisodeDetail />}
        />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;