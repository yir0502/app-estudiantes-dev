export interface Enrollment {
  id: string; // Firestore ID
  studentId: string; // UID del alumno
  studentNombre: string; // Nombre guardado al momento de inscripción
  classId: string; // Relación con ClassModel
  status: "active" | "dropped";
  viewedByProfessor: boolean; // Controla el badge rojo
  createdAt: any;
}
