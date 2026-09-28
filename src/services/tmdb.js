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

export async function searchCompany(query) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    query,
  });

  const response = await fetch(`${BASE_URL}/search/company?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results; // [{ id, name, logo_path }, ...]
}

export async function discoverShowsByGenre(genreId, filters = {}, page = 1) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_genres: genreId,
    language: "it-IT",
    sort_by: filters.sortBy || "popularity.desc",
    page: String(page),
  });

  if (filters.minVote) {
    params.set("vote_average.gte", filters.minVote);
    // TODO: soglia vote_count.gte fissa a 20, da rivedere — magari renderla
    // dinamica in base all'anno filtrato (soglia più bassa per le novità)
    params.set("vote_count.gte", "20");
  }

  if (filters.year) {
    params.set("first_air_date_year", filters.year);
  } else {
    if (filters.yearFrom) {
      params.set("first_air_date.gte", `${filters.yearFrom}-01-01`);
    }
    if (filters.yearTo) {
      params.set("first_air_date.lte", `${filters.yearTo}-12-31`);
    }
  }

  if (filters.providerId) {
    params.set("with_watch_providers", filters.providerId);
    params.set("watch_region", "IT");
  }

  if (filters.companyId) {
    params.set("with_companies", filters.companyId);
  }

  const response = await fetch(`${BASE_URL}/discover/tv?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return { results: data.results, totalPages: data.total_pages };
}

export async function getNewShowsByProvider(providerId, region = "IT") {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const params = new URLSearchParams({
    api_key: API_KEY,
    with_watch_providers: providerId,
    watch_region: region,
    "first_air_date.gte": weekAgo.toISOString().slice(0, 10),
    "first_air_date.lte": today.toISOString().slice(0, 10),
    sort_by: "first_air_date.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/tv?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getExclusivesByNetwork(networkId) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_networks: networkId,
    sort_by: "popularity.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/tv?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results.slice(0, 10);
}
