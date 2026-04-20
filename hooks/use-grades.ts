import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/src/api/firebase";
import { Grade } from "@/src/domain/grade";
import { useAuth } from "@/src/lib/auth-context";

export function useGrades(classId?: string, targetUserId?: string) {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const effectiveUserId = targetUserId || user?.uid;
    if (!effectiveUserId) return;

    let q = query(
      collection(db, "grades"),
      where("userId", "==", effectiveUserId)
    );

    if (classId) {
      q = query(
        collection(db, "grades"),
        where("userId", "==", effectiveUserId),
        where("classId", "==", classId)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Grade[];
      setGrades(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching grades:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, classId]);

  return { grades, loading };
}

