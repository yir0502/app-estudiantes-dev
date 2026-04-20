import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, writeBatch, getDocs, doc } from "firebase/firestore";
import { db } from "@/src/api/firebase";
import { Enrollment } from "@/src/domain/enrollment";
import { ClassModel } from "@/src/domain/class";
import { useAuth } from "@/src/lib/auth-context";
import { checkTimeConflict } from "@/src/utils/time";

export const useEnrollments = () => {
  const { user, profile } = useAuth();
  const [myEnrollments, setMyEnrollments] = useState<(Enrollment & { classData?: ClassModel })[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Obtener inscripciones del alumno logueado con datos de la clase (Join)
  useEffect(() => {
    if (!user) return;

    if (profile && profile.rol !== 'estudiante') {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "enrollments"), where("studentId", "==", user.uid), where("status", "==", "active"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const enrollmentDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      
      // Para cada inscripción, necesitamos los datos de la clase
      const joinedData = await Promise.all(enrollmentDocs.map(async (enr) => {
        const classSnap = await getDocs(query(collection(db, "classes"), where("__name__", "==", enr.classId)));
        const classData = classSnap.docs[0]?.data() as ClassModel;
        return { ...enr, classData };
      }));

      setMyEnrollments(joinedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  // 2. Inscribir alumno
  const enrollInClass = async (targetClass: ClassModel) => {
    if (!user || profile?.rol !== 'estudiante') throw new Error("Solo los alumnos pueden inscribirse.");

    // Validar conflictos con materias ya inscritas
    const hasConflict = myEnrollments.some(enr => {
      if (!enr.classData) return false;
      return checkTimeConflict(
        targetClass.dias, targetClass.horaInicio, targetClass.horaFin,
        enr.classData.dias, enr.classData.horaInicio, enr.classData.horaFin
      );
    });

    if (hasConflict) {
      throw new Error("Esta clase se solapa con una materia ya inscrita en tu horario.");
    }

    // Validar si ya está inscrito
    const isAlreadyEnrolled = myEnrollments.some(enr => enr.classId === targetClass.id);
    if (isAlreadyEnrolled) {
      throw new Error("Ya estás inscrito en esta materia.");
    }

    await addDoc(collection(db, "enrollments"), {
      studentId: user.uid,
      studentNombre: profile?.nombre || "Estudiante",
      classId: targetClass.id,
      status: "active",
      viewedByProfessor: false,
      createdAt: serverTimestamp(),
    });
  };

  // 3. Obtener alumnos de una clase específica (Para el Profesor)
  const useClassMembers = (classId: string) => {
    const [members, setMembers] = useState<Enrollment[]>([]);
    
    useEffect(() => {
      if (!classId) return;
      const q = query(collection(db, "enrollments"), where("classId", "==", classId), where("status", "==", "active"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
        setMembers(docs);
      });
      return () => unsubscribe();
    }, [classId]);

    const markAsViewed = async () => {
      const batch = writeBatch(db);
      const unviewed = members.filter(m => !m.viewedByProfessor);
      unviewed.forEach(m => {
        batch.update(doc(db, "enrollments", m.id), { viewedByProfessor: true });
      });
      await batch.commit();
    };

    return { members, markAsViewed };
  };

  // 4. Obtener conteo de nuevos alumnos de todas las clases de un profesor
  const useNewEnrollmentsCount = (professorClassesIds: string[]) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (professorClassesIds.length === 0) return;
      
      const q = query(
        collection(db, "enrollments"), 
        where("classId", "in", professorClassesIds),
        where("viewedByProfessor", "==", false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setCount(snapshot.size);
      });
      
      return () => unsubscribe();
    }, [professorClassesIds]);

    return count;
  };

  return { myEnrollments, loading, enrollInClass, useClassMembers, useNewEnrollmentsCount };
};
