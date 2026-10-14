export const STREAMING_KEYWORDS = [
  { label: "Netflix", keyword: "netflix", network: 213 },
  { label: "Prime Video", keyword: "prime video", network: 1024 },
  { label: "Apple TV+", keyword: "apple tv", network: 2552 },
  { label: "Disney+", keyword: "disney", network: 2739 },
  { label: "Paramount+", keyword: "paramount", network: 4330 },
  { label: "Sky Go", keyword: "sky go", network: 1114 },
  { label: "NOW TV", keyword: "now tv", network: 1114 },
  { label: "Infinity+", keyword: "infinity", network: 3980 },
  // Le piattaforme senza "network" mostrano comunque i titoli disponibili,
  // ma non la sezione delle esclusive (serve l'ID network di TMDB).
  { label: "Discovery+", keyword: "discovery", network: null },
  { label: "RaiPlay", keyword: "raiplay", network: null },
  { label: "TIMVision", keyword: "timvision", network: null },
  { label: "Crunchyroll", keyword: "crunchyroll", network: null },
  { label: "MUBI", keyword: "mubi", network: null },
  { label: "Chili", keyword: "chili", network: null },
];
