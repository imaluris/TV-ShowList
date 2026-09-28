const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_URL = "https://image.tmdb.org/t/p/w200";
export const IMG_URL_LARGE = "https://image.tmdb.org/t/p/w500";

export async function getPopularShows() {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/trending/tv/day?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getTopByProvider(providerId, region = "IT") {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_watch_providers: providerId,
    watch_region: region,
    sort_by: "popularity.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/tv?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();

  return data.results.slice(0, 10); // solo i primi 10
}

export async function getShowDetails(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/tv/${id}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getCreditsShow(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/tv/${id}/credits?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getVideoShow(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/tv/${id}/videos?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

export async function getSimilarShows(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/tv/${id}/similar?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

export async function getRecommendedShows(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(
    `${BASE_URL}/tv/${id}/recommendations?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

export async function getShowsByGenres(genreIds) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/tv?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getWatchProviders(region = "IT") {
  const params = new URLSearchParams({
    api_key: API_KEY,
    watch_region: region,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/watch/providers/tv?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getGenres() {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/genre/tv/list?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.genres;
}

export async function getAggregateCreditsShow(id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(
    `${BASE_URL}/tv/${id}/aggregate_credits?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
