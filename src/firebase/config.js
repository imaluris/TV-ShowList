// Inizializzazione Firebase.
// Incolla qui SOTTO l'oggetto firebaseConfig che hai copiato dal pannello
// Firebase (Impostazioni progetto -> Le tue app -> icona web </>).
//
// Ricorda: questa apiKey NON è un segreto come una API key normale —
// Firebase è progettato per esporla nel frontend. La sicurezza vera la
// fanno le regole di Firestore/Authentication, non questa chiave.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLY7pUYH4M6xJzRtgIfmRFTfMBtgZfAeM",
  authDomain: "tv-showlist.firebaseapp.com",
  projectId: "tv-showlist",
  storageBucket: "tv-showlist.firebasestorage.app",
  messagingSenderId: "166275455433",
  appId: "1:166275455433:web:59a54506d14bc184823018"
};

const app = initializeApp(firebaseConfig);

// Questi due export sono ciò che il resto dell'app userà per parlare
// con Firebase: "auth" per login/registrazione, "db" per Firestore.
export const auth = getAuth(app);
export const db = getFirestore(app);
