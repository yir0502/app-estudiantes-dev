import { db } from "@/src/api/firebase";
import { UserProfile } from "@/src/domain/user";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("nombre", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as UserProfile);
        setUsers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener usuarios:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { users, loading };
}