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

// Utenti con almeno un token: { uid, tokens, notificationsRef }.
async function getSubscribers() {
  const snapshot = await db.collectionGroup("profile").get();
  const subscribers = [];

  snapshot.forEach((docSnap) => {
    if (docSnap.id !== "notifications") return;
    const tokens = docSnap.data().tokens || [];
    if (tokens.length === 0) return;
    subscribers.push({
      uid: docSnap.ref.parent.parent.id,
      tokens,
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
      const newKeys = episodes
        .filter((e) => e.time > startedMs && e.time <= now && !watched.has(e.key))
        .map((e) => e.key);

      const alreadyNotified = new Set(item.notifiedEpisodes || []);
      const toNotify = newKeys.filter((key) => !alreadyNotified.has(key));

      // Una serie "Vista" con novità torna "In corso".
      if (item.status === "watched" && !DRY_RUN) {
        await docSnap.ref.set({ status: "watching" }, { merge: true });
      }

      if (toNotify.length > 0) {
        results.push({
          docRef: docSnap.ref,
          title: item.title,
          news,
          newKeys: toNotify,
        });
      }
    } catch (err) {
      console.error(`Serie ${item.id} saltata:`, err.message);
    }
  }
  return results;
}

function describe({ news }) {
  if (news.newSeason) return "A new season is available";
  return news.count === 1 ? "1 new episode available" : `${news.count} new episodes available`;
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

async function main() {
  const subscribers = await getSubscribers();
  console.log(`Utenti con le notifiche attive: ${subscribers.length}`);

  for (const subscriber of subscribers) {
    const found = await findNews(subscriber.uid);
    if (found.length === 0) {
      console.log(`${subscriber.uid}: nessuna novità`);
      continue;
    }

    const messages = buildMessages(found);
    console.log(
      `${subscriber.uid}: ${found.length} serie con novità`,
      found.map((f) => `${f.title} (${f.newKeys.join(", ")})`),
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
