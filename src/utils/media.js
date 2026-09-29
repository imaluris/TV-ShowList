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