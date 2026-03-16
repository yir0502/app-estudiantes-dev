import { db } from "@/src/api/firebase";
import { UserProfile } from "@/src/domain/user";
import { useAuth } from "@/src/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error al obtener perfil:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid]);

  return { profile, loading };
}