export interface ClassModel {
  id: string; // Firestore ID
  profesorId: string; // UID del creador
  profesorNombre: string;
  materia: string;
  salon: string;
  dias: string[]; // Ej: ["Lunes", "Miércoles"]
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  color: string;
  cupo: number;
  createdAt: any;
}
