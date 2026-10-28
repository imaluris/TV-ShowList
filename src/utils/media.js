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
