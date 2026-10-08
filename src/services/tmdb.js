const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_URL = "https://image.tmdb.org/t/p/w200";
export const IMG_URL_LARGE = "https://image.tmdb.org/t/p/w500";

export async function getPopularShows(mediaType) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/trending/${mediaType}/day?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getTopByProvider(mediaType, providerId, region = "IT") {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_watch_providers: providerId,
    watch_region: region,
    sort_by: "popularity.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();

  return data.results.slice(0, 10); // solo i primi 10
}

export async function getShowDetails(mediaType, id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/${mediaType}/${id}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getCreditsShow(mediaType, id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/${mediaType}/${id}/credits?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getVideoShow(mediaType, id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/${mediaType}/${id}/videos?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

export async function getSimilarShows(mediaType, id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/${mediaType}/${id}/similar?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

export async function getRecommendedShows(mediaType, id) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(
    `${BASE_URL}/${mediaType}/${id}/recommendations?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }
  const data = await response.json();
  return data.results;
}

export async function getShowsByGenres(mediaType, genreIds) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

// Come getShowsByGenres, ma restituisce titoli di UNO QUALSIASI dei generi
// (separatore "|" = OR di TMDB), invece di richiederli tutti insieme.
export async function getShowsByAnyGenre(mediaType, genreIds) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_genres: genreIds.join("|"),
    sort_by: "popularity.desc",
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getWatchProviders(mediaType, region = "IT") {
  const params = new URLSearchParams({
    api_key: API_KEY,
    watch_region: region,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/watch/providers/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getGenres(mediaType) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/genre/${mediaType}/list?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.genres;
}

export async function getAggregateCreditsShow(mediaType, id) {
  // I film non hanno /aggregate_credits (solo le serie TV ce l'hanno).
  // Per i film usiamo /credits e normalizziamo il cast nello stesso
  // formato (roles[0].character), così CastCard non deve sapere la
  // differenza tra i due casi.
  if (mediaType === "movie") {
    const data = await getCreditsShow("movie", id);
    const cast = data.cast.map((member) => ({
      ...member,
      roles: [{ character: member.character }],
    }));
    return { ...data, cast };
  }

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

export async function discoverShowsByGenre(mediaType, genreId, filters = {}, page = 1) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    with_genres: genreId,
    language: "it-IT",
    sort_by: filters.sortBy || "popularity.desc",
    page: String(page),
  });

  // Le serie usano first_air_date, i film primary_release_date: nomi di
  // parametro diversi per lo stesso concetto ("quando è uscito").
  const dateField = mediaType === "movie" ? "primary_release_date" : "first_air_date";
  const yearField = mediaType === "movie" ? "primary_release_year" : "first_air_date_year";

  if (filters.minVote) {
    params.set("vote_average.gte", filters.minVote);
    // TODO: soglia vote_count.gte fissa a 20, da rivedere — magari renderla
    // dinamica in base all'anno filtrato (soglia più bassa per le novità)
    params.set("vote_count.gte", "20");
  }

  if (filters.year) {
    params.set(yearField, filters.year);
  } else {
    if (filters.yearFrom) {
      params.set(`${dateField}.gte`, `${filters.yearFrom}-01-01`);
    }
    if (filters.yearTo) {
      params.set(`${dateField}.lte`, `${filters.yearTo}-12-31`);
    }
  }

  if (filters.providerId) {
    params.set("with_watch_providers", filters.providerId);
    params.set("watch_region", "IT");
  }

  if (filters.companyId) {
    params.set("with_companies", filters.companyId);
  }

  const response = await fetch(`${BASE_URL}/discover/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return { results: data.results, totalPages: data.total_pages };
}

export async function getNewShowsByProvider(mediaType, providerId, region = "IT") {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const dateField = mediaType === "movie" ? "primary_release_date" : "first_air_date";

  const params = new URLSearchParams({
    api_key: API_KEY,
    with_watch_providers: providerId,
    watch_region: region,
    [`${dateField}.gte`]: weekAgo.toISOString().slice(0, 10),
    [`${dateField}.lte`]: today.toISOString().slice(0, 10),
    sort_by: `${dateField}.desc`,
    language: "it-IT",
  });

  const response = await fetch(`${BASE_URL}/discover/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

export async function getExclusivesByNetwork(networkId) {
  // Solo per le serie TV: i "network" sono un concetto TV (emittente/
  // servizio streaming). Per i film non esiste un equivalente diretto in
  // TMDB — se in futuro vogliamo "esclusive film" dovremo ripensarla con
  // with_companies invece di with_networks. Per ora questa funzione viene
  // chiamata solo quando mediaType === "tv" (lo gestiamo in Provider.jsx).
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

export async function getSeasonDetails(showId, seasonNumber) {
  const paramsIt = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
    append_to_response: "credits",
  });

  const paramsEn = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
  });

  const [resIt, resEn] = await Promise.all([
    fetch(`${BASE_URL}/tv/${showId}/season/${seasonNumber}?${paramsIt}`),
    fetch(`${BASE_URL}/tv/${showId}/season/${seasonNumber}?${paramsEn}`),
  ]);

  if (!resIt.ok) {
    throw new Error(`Errore nella fetch: ${resIt.status}`);
  }

  const dataIt = await resIt.json();

  if (resEn.ok) {
    const dataEn = await resEn.json();

    const overviewByEpisodeNumber = {};
    dataEn.episodes.forEach((ep) => {
      overviewByEpisodeNumber[ep.episode_number] = ep.overview;
    });

    dataIt.episodes = dataIt.episodes.map((episode) => ({
      ...episode,
      overview:
        episode.overview ||
        overviewByEpisodeNumber[episode.episode_number] ||
        "",
    }));

    if (!dataIt.overview) {
      dataIt.overview = dataEn.overview || "";
    }
  }

  return dataIt;
}

export async function getEpisodeDetails(showId, seasonNumber, episodeNumber) {
  const paramsIt = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
    append_to_response: "credits",
  });

  const paramsEn = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
  });

  const [resIt, resEn] = await Promise.all([
    fetch(
      `${BASE_URL}/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?${paramsIt}`,
    ),
    fetch(
      `${BASE_URL}/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?${paramsEn}`,
    ),
  ]);

  if (!resIt.ok) {
    throw new Error(`Errore nella fetch: ${resIt.status}`);
  }

  const dataIt = await resIt.json();

  if (resEn.ok && !dataIt.overview) {
    const dataEn = await resEn.json();
    dataIt.overview = dataEn.overview || "";
  }

  return dataIt;
}

export async function getSeasonCredits(showId, seasonNumber) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(
    `${BASE_URL}/tv/${showId}/season/${seasonNumber}/credits?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data; // { cast: [...], crew: [...] }
}

export async function getPersonImages(personId) {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });

  const response = await fetch(
    `${BASE_URL}/person/${personId}/images?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.profiles;
}

export async function getPersonDetails(personId) {
  const paramsIt = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const paramsEn = new URLSearchParams({
    api_key: API_KEY,
    language: "en-US",
  });

  const [resIt, resEn] = await Promise.all([
    fetch(`${BASE_URL}/person/${personId}?${paramsIt}`),
    fetch(`${BASE_URL}/person/${personId}?${paramsEn}`),
  ]);

  if (!resIt.ok) {
    throw new Error(`Errore nella fetch: ${resIt.status}`);
  }

  const dataIt = await resIt.json();

  if (resEn.ok && !dataIt.biography) {
    const dataEn = await resEn.json();
    dataIt.biography = dataEn.biography || "";
  }

  return dataIt;
}

export async function getPersonCombinedCredits(personId) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
  });

  const response = await fetch(
    `${BASE_URL}/person/${personId}/combined_credits?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.cast;
}

export async function searchShows(mediaType, query) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: "it-IT",
    query,
  });

  const response = await fetch(`${BASE_URL}/search/${mediaType}?${params}`);

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}