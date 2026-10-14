import {
  Baby,
  Camera,
  Clapperboard,
  Compass,
  Drama,
  Fingerprint,
  Ghost,
  Heart,
  Landmark,
  Laugh,
  Mic,
  Mountain,
  Music,
  Newspaper,
  Palette,
  Rocket,
  Scroll,
  Search,
  Shield,
  Siren,
  Sparkles,
  Swords,
  Tv,
  Users,
} from "lucide-react";

// Icona di ogni genere TMDB (gli ID sono quelli di film e serie TV).
// I generi che non sono in elenco usano l'icona di riserva.
const GENRE_ICONS = {
  28: Swords, // Action
  10759: Swords, // Action & Adventure
  12: Compass, // Adventure
  16: Palette, // Animation
  35: Laugh, // Comedy
  80: Fingerprint, // Crime
  99: Camera, // Documentary
  18: Drama, // Drama
  10751: Users, // Family
  14: Sparkles, // Fantasy
  36: Scroll, // History
  27: Ghost, // Horror
  10402: Music, // Music
  9648: Search, // Mystery
  10749: Heart, // Romance
  878: Rocket, // Science Fiction
  10765: Rocket, // Sci-Fi & Fantasy
  10770: Tv, // TV Movie
  53: Siren, // Thriller
  10752: Shield, // War
  37: Mountain, // Western
  10762: Baby, // Kids
  10763: Newspaper, // News
  10764: Tv, // Reality
  10766: Heart, // Soap
  10767: Mic, // Talk
  10768: Landmark, // War & Politics
};

export function getGenreIcon(genreId) {
  return GENRE_ICONS[genreId] || Clapperboard;
}

// Ogni genere ha il suo colore (angolo sulla ruota dei colori), sempre lo
// stesso per lo stesso ID, così le tessere sono varie ma riconoscibili.
export function getGenreHue(genreId) {
  return (genreId * 47) % 360;
}

