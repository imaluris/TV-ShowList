import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  updateProfile,
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
import { createGoogleProvider, hasPasswordProvider } from "./auth";

// Firebase vuole che le operazioni delicate (cambio email/password,
// eliminazione) siano fatte da chi è entrato di recente: riconfermiamo
// l'identità con la password attuale, oppure con Google per chi è entrato
// con Google e non ha una password.
async function reauthenticate(currentPassword) {
  const user = auth.currentUser;

  if (hasPasswordProvider(user)) {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  } else {
    await reauthenticateWithPopup(user, createGoogleProvider());
  }

  return user;
}

// Firebase restituisce codici tecnici: li traduciamo in frasi leggibili.
export function getAuthErrorMessage(err) {
  switch (err.code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Your current password is incorrect.";
    case "auth/weak-password":
      return "The new password is too weak (at least 6 characters).";
    case "auth/email-already-in-use":
      return "This email is already used by another account.";
    case "auth/invalid-email":
      return "The email address isn't valid.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Operation cancelled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again in a few minutes.";
    case "auth/requires-recent-login":
      return "For security, please log in again: log out, log back in, and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// Il cambio email non è immediato: Firebase manda un link di conferma al
// NUOVO indirizzo e l'email cambia solo quando l'utente lo apre.
export async function requestEmailChange(currentPassword, newEmail) {
  const user = await reauthenticate(currentPassword);
  await verifyBeforeUpdateEmail(user, newEmail);
}

// Il nome visualizzato non richiede riautenticazione.
export async function changeDisplayName(newName) {
  await updateProfile(auth.currentUser, { displayName: newName });
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
