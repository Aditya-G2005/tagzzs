import { db, auth } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import { userDataCache } from "@/lib/userDataCache";

export async function cacheUserData() {
  const user = auth.currentUser;
  if (!user) return;

  const notesSnap = await getDocs(collection(db, "users", user.uid, "notes"));
  const tagsSnap = await getDocs(collection(db, "users", user.uid, "tags"));

  userDataCache[user.uid] = {
    notes: notesSnap.docs.map((doc) => doc.data()),
    tags: tagsSnap.docs.map((doc) => doc.data()),
  };

  console.log("Cached user data:", userDataCache[user.uid]);
}
