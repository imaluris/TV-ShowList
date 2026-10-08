import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
  deleteUser,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Firebase vuole che le operazioni delicate (cambio email/password,
// eliminazione) siano fatte da chi è entrato di recente: riconfermiamo
// l'identità con la password attuale.
async function reauthenticate(currentPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return user;
}

// Firebase restituisce codici tecnici: li traduciamo in frasi leggibili.
export function getAuthErrorMessage(err) {
  switch (err.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "La password attuale non è corretta.";
    case "auth/weak-password":
      return "La nuova password è troppo debole (almeno 6 caratteri).";
    case "auth/email-already-in-use":
      return "Questa email è già usata da un altro account.";
    case "auth/invalid-email":
      return "L'indirizzo email non è valido.";
    case "auth/too-many-requests":
      return "Troppi tentativi. Riprova tra qualche minuto.";
    case "auth/requires-recent-login":
      return "Per sicurezza devi riaccedere: esci, entra di nuovo e riprova.";
    default:
      return "Qualcosa è andato storto. Riprova.";
  }
}

// Il cambio email non è immediato: Firebase manda un link di conferma al
// NUOVO indirizzo e l'email cambia solo quando l'utente lo apre.
export async function requestEmailChange(currentPassword, newEmail) {
  const user = await reauthenticate(currentPassword);
  await verifyBeforeUpdateEmail(user, newEmail);
}

export async function changePassword(currentPassword, newPassword) {
  const user = await reauthenticate(currentPassword);
  await updatePassword(user, newPassword);
}

// Cancella tutti i documenti di una collezione, a gruppi (un batch di
// Firestore accetta al massimo 500 operazioni).
async function deleteCollection(collectionRef) {
  const snapshot = await getDocs(collectionRef);
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach((docSnap) => batch.delete(docSnap.ref));
    await batch.commit();
  }
}

// Elimina prima i dati su Firestore (servono ancora i permessi dell'utente
// loggato) e solo dopo l'account vero e proprio.
export async function deleteAccount(currentPassword) {
  const user = await reauthenticate(currentPassword);

  await deleteCollection(collection(db, "users", user.uid, "library"));
  await deleteDoc(doc(db, "users", user.uid, "profile", "preferences"));

  await deleteUser(user);
}
