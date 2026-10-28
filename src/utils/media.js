// Le serie TV usano `name`/`first_air_date`, i film usano `title`/`release_date`.
// Questi due helper astraggono la differenza, così i componenti non devono
// sapere con cosa hanno a che fare.

export function getTitle(item) {
  return item.title || item.name || "";
}

export function getDate(item) {
  return item.release_date || item.first_air_date || "";
}

export function getYear(item) {
  const date = getDate(item);
  return date ? date.slice(0, 4) : "";
}

// Una serie è "in corso" se TMDB dice che continua o ha già un prossimo
// episodio in programma. Finché lo è, vedere tutti gli episodi usciti non la
// rende "Vista": ne usciranno altri.
const ONGOING_STATUSES = ["Returning Series", "In Production", "Planned"];

export function isShowOngoing(show) {
  if (!show) return false;
  return ONGOING_STATUSES.includes(show.status) || Boolean(show.next_episode_to_air);
}

// Aggiunge a ogni stagione `aired_count`: quanti episodi sono davvero già
// usciti. TMDB spesso pubblica una stagione nuova con tutti gli episodi e le
// date future, quindi `episode_count` conta anche episodi che non esistono
// ancora. Si ricava dall'ultimo episodio andato in onda (`last_episode_to_air`):
// le stagioni prima sono complete, quella dell'ultimo episodio arriva fin lì,
// le successive non sono uscite.
export function getSeasonsWithAired(show) {
  const seasons = show?.seasons || [];
  const last = show?.last_episode_to_air;

  return seasons.map((season) => {
    let airedCount = season.episode_count;

    if (last) {
      if (season.season_number > last.season_number) airedCount = 0;
      else if (season.season_number === last.season_number) {
        airedCount = Math.min(last.episode_number, season.episode_count);
      }
    } else if (isShowOngoing(show)) {
      // Serie in corso senza nessun episodio ancora uscito.
      airedCount = 0;
    }

    return { ...season, aired_count: airedCount };
  });
}

// Episodi già usciti di una stagione (ripiego: tutti, per dati salvati prima).
export function getAiredCount(season) {
  return season.aired_count ?? season.episode_count;
}
