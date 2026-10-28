// Controllo giornaliero dei nuovi episodi: per ogni utente che ha attivato le
// notifiche guarda le serie in libreria, e manda una notifica push per gli
// episodi usciti dopo che ha iniziato la serie e non ancora visti.
//
// Si lancia con `node scripts/notify-new-episodes.mjs` (lo fa GitHub Actions,
// vedi .github/workflows/notify-new-episodes.yml).
//
// Variabili d'ambiente:
//   FIREBASE_SERVICE_ACCOUNT  JSON della chiave di servizio Firebase
//   TMDB_API_KEY              chiave API di TMDB
//   DRY_RUN=1                 non manda nulla e non scrive su Firestore

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  canHaveNewEpisodes,
  getNewEpisodes,
  getStartedMillis,
  toDatedKeys,
} from "../src/utils/newEpisodes.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const MAX_SEASONS = 4;
const MAX_SINGLE_NOTIFICATIONS = 3;
const DRY_RUN = process.env.DRY_RUN === "1";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Manca la variabile d'ambiente ${name}`);
    process.exit(1);
  }
  return value;
}

const TMDB_API_KEY = requireEnv("TMDB_API_KEY");
initializeApp({
  credential: cert(JSON.parse(requireEnv("FIREBASE_SERVICE_ACCOUNT"))),
});
const db = getFirestore();

async function tmdb(path) {
  const response = await fetch(`${TMDB_BASE_URL}${path}?api_key=${TMDB_API_KEY}`);
  if (!response.ok) throw new Error(`TMDB ${path}: ${response.status}`);
  return response.json();
}

// Date degli episodi usciti da quando hai iniziato (stessa logica dell'app,
// vedi src/hooks/useNewEpisodes.js).
async function loadEpisodes(tmdbId, startedMs) {
  const details = await tmdb(`/tv/${tmdbId}`);
  const last = details.last_episode_to_air;
  if (!last?.air_date) return [];
  if (new Date(last.air_date).getTime() <= startedMs) return [];

  const episodes = [];
  for (let n = 0; n < MAX_SEASONS; n++) {
    const seasonNumber = last.season_number - n;
    if (seasonNumber < 1) break;

    const season = await tmdb(`/tv/${tmdbId}/season/${seasonNumber}`);
    const dated = toDatedKeys(seasonNumber, season.episodes || []);
    episodes.push(...dated);
    if (dated.some((episode) => episode.time <= startedMs)) break;
  }
  return episodes;
}

// Un dispositivo che non apre l'app da più di 45 giorni si considera
// disinstallato: il suo token viene tolto. L'app aggiorna `seen` a ogni
// apertura (al massimo una volta al giorno). Senza `seen` (token vecchi) non
// si scarta nulla.
const STALE_DAYS = 45;

function isStale(seen, token) {
  const stamp = seen?.[token];
  if (!stamp) return false;
  return Date.now() - stamp.toMillis() > STALE_DAYS * 24 * 60 * 60 * 1000;
}

// Utenti con almeno un token: { uid, tokens, notificationsRef }.
async function getSubscribers() {
  const snapshot = await db.collectionGroup("profile").get();
  const subscribers = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id !== "notifications") return;
    const data = docSnap.data();
    const allTokens = data.tokens || [];
    const tokens = allTokens.filter((token) => !isStale(data.seen, token));
    const staleTokens = allTokens.filter((token) => isStale(data.seen, token));
    if (tokens.length === 0 && staleTokens.length === 0) return;
    subscribers.push({
      uid: docSnap.ref.parent.parent.id,
      tokens,
      staleTokens,
      notificationsRef: docSnap.ref,
    });
  });
  return subscribers;
}

// Serie con novità per un utente: [{ docRef, title, news, newKeys }].
async function findNews(uid) {
  const library = await db.collection("users").doc(uid).collection("library").get();
  const results = [];

  for (const docSnap of library.docs) {
    const item = { id: docSnap.id, ...docSnap.data() };
    if (!canHaveNewEpisodes(item)) continue;

    try {
      const episodes = await loadEpisodes(item.tmdbId, getStartedMillis(item));
      const news = getNewEpisodes(item, { episodes });
      if (!news) continue;

      // Chiavi degli episodi nuovi, per non avvisare due volte per gli stessi.
      const watched = new Set(item.watchedEpisodes || []);
      const startedMs = getStartedMillis(item);
      const now = Date.now();
      const newEpisodes = episodes
        .filter((e) => e.time > startedMs && e.time <= now && !watched.has(e.key))
        .sort((a, b) => a.time - b.time);

      const alreadyNotified = new Set(item.notifiedEpisodes || []);
      const toNotifyEpisodes = newEpisodes.filter((e) => !alreadyNotified.has(e.key));
      const toNotify = toNotifyEpisodes.map((e) => e.key);

      // Una serie "Vista" con novità torna "In corso".
      if (item.status === "watched" && !DRY_RUN) {
        await docSnap.ref.set({ status: "watching" }, { merge: true });
      }

      if (toNotify.length > 0) {
        results.push({
          docRef: docSnap.ref,
          title: item.title,
          news,
          episodes: toNotifyEpisodes,
          newKeys: toNotify,
        });
      }
    } catch (err) {
      console.error(`Serie ${item.id} saltata:`, err.message);
    }
  }
  return results;
}

// "S2E5" -> "Season 2, episode 5"
function formatKey(key) {
  const [, season, episode] = key.match(/^S(\d+)E(\d+)$/) || [];
  return season ? `S${season}E${episode}` : key;
}

// Testo della notifica: quali episodi sono usciti, con il titolo se c'è.
// Un episodio:  "S2E5 · Titolo dell'episodio"
// Più episodi:  "S2E5 · Titolo, S2E6 · Titolo" (al massimo 2, poi "e altri N")
// Nuova stagione: "New season: S3E1 · Titolo e altri 7 episodi"
function describe({ news, episodes }) {
  const label = (episode) =>
    episode.name ? `${formatKey(episode.key)} · ${episode.name}` : formatKey(episode.key);

  const shown = episodes.slice(0, 2).map(label).join(", ");
  const rest = episodes.length - 2;
  const list = rest > 0 ? `${shown} and ${rest} more` : shown;

  return news.newSeason ? `New season: ${list}` : list;
}

// Costruisce le notifiche: una per serie, oppure una sola riassuntiva.
function buildMessages(found) {
  if (found.length <= MAX_SINGLE_NOTIFICATIONS) {
    return found.map((entry) => ({
      title: entry.title,
      body: describe(entry),
      url: "/TVShowList/library",
    }));
  }
  return [
    {
      title: "New episodes",
      body: `${found.length} of your shows have new episodes`,
      url: "/TVShowList/library",
    },
  ];
}

async function sendMessages(subscriber, messages) {
  const invalidTokens = new Set();

  for (const message of messages) {
    const response = await getMessaging().sendEachForMulticast({
      tokens: subscriber.tokens,
      data: message, // solo `data`: lo mostra il service worker dell'app
    });

    response.responses.forEach((result, index) => {
      const code = result.error?.code;
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        invalidTokens.add(subscriber.tokens[index]);
      }
    });
  }

  // Token di dispositivi che non esistono più: li togliamo.
  if (invalidTokens.size > 0) {
    await subscriber.notificationsRef.set(
      { tokens: FieldValue.arrayRemove(...invalidTokens) },
      { merge: true },
    );
  }
}

// Toglie da Firestore i dispositivi che non si fanno vivi da troppo tempo.
async function removeStaleTokens(subscriber) {
  if (subscriber.staleTokens.length === 0) return;
  console.log(`${subscriber.uid}: tolti ${subscriber.staleTokens.length} dispositivi inattivi`);
  if (DRY_RUN) return;
  await subscriber.notificationsRef.set(
    { tokens: FieldValue.arrayRemove(...subscriber.staleTokens) },
    { merge: true },
  );
}

async function main() {
  const subscribers = await getSubscribers();
  console.log(`Utenti con le notifiche attive: ${subscribers.length}`);

  for (const subscriber of subscribers) {
    await removeStaleTokens(subscriber);
    if (subscriber.tokens.length === 0) continue;

    const found = await findNews(subscriber.uid);
    if (found.length === 0) {
      console.log(`${subscriber.uid}: nessuna novità`);
      continue;
    }

    const messages = buildMessages(found);
    console.log(
      `${subscriber.uid}: ${found.length} serie con novità`,
      messages.map((m) => `${m.title}: ${m.body}`),
    );
    if (DRY_RUN) continue;

    await sendMessages(subscriber, messages);

    // Ricordiamo gli episodi già notificati.
    for (const entry of found) {
      await entry.docRef.set(
        { notifiedEpisodes: FieldValue.arrayUnion(...entry.newKeys) },
        { merge: true },
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
