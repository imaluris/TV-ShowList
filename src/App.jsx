import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ShowDetail from "./pages/show/ShowDetail.jsx";
import Genre from "./pages/show/Genre.jsx";
import Provider from "./pages/show/Provider.jsx";
import SeasonDetail from "./pages/show/SeasonDetail.jsx";
import EpisodeDetail from "./pages/show/EpisodeDetail.jsx";
import PersonDetail from "./pages/show/PersonDetail.jsx";
import Library from "./pages/library/Library.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Appearance from "./pages/profile/Appearance.jsx";
import Language from "./pages/profile/Language.jsx";
import Genres from "./pages/profile/Genres.jsx";
import About from "./pages/profile/About.jsx";
import Account from "./pages/profile/Account.jsx";

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
        <Route path="/profile/appearance" element={<Appearance />} />
        <Route path="/profile/language" element={<Language />} />
        <Route path="/profile/genres" element={<Genres />} />
        <Route path="/profile/about" element={<About />} />
        <Route path="/profile/account" element={<Account />} />
      </Route>
    </Routes>
  );
}

export default App;