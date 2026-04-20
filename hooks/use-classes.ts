import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "@/src/api/firebase";
import { ClassModel } from "@/src/domain/class";
import { useAuth } from "@/src/lib/auth-context";
import { checkTimeConflict } from "@/src/utils/time";

export const useClasses = () => {
  const { user, profile } = useAuth();
  const [catalog, setCatalog] = useState<ClassModel[]>([]);
  const [professorClasses, setProfessorClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Catalogo (Todas las clases)
  useEffect(() => {
    const q = query(collection(db, "classes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassModel));
      setCatalog(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Clases del Profesor logueado
  useEffect(() => {
    if (!user || profile?.rol !== 'profesor') return;
    const q = query(collection(db, "classes"), where("profesorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassModel));
      setProfessorClasses(docs);
    });
    return () => unsubscribe();
  }, [user]);

  const createClass = async (classData: Omit<ClassModel, 'id' | 'profesorId' | 'profesorNombre' | 'createdAt'>) => {
    if (!user || profile?.rol !== 'profesor') throw new Error("Solo los profesores pueden crear clases.");

    // Validar conflicto de horario para el profesor
    const hasConflict = professorClasses.some(existingClass => 
      checkTimeConflict(
        classData.dias, classData.horaInicio, classData.horaFin,
        existingClass.dias, existingClass.horaInicio, existingClass.horaFin
      )
    );

    if (hasConflict) {
      throw new Error("Ya tienes una clase registrada en este horario.");
    }

    await addDoc(collection(db, "classes"), {
      ...classData,
      profesorId: user.uid,
      profesorNombre: profile?.nombre || "Profesor",
      createdAt: serverTimestamp(),
    });
  };

  return { catalog, professorClasses, loading, createClass };
};
