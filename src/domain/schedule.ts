export type WeekDay = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";

export interface Schedule {
  id: string;          // ID único (ID de Firestore)
  userId: string;      // Dueño del horario
  materia: string;     // Nombre de la asignatura
  salon: string;       // Ubicación del aula
  dias: WeekDay[];     // Días de la semana
  horaInicio: string;  // Formato "HH:mm"
  horaFin: string;     // Formato "HH:mm"
  profesor?: string;   // Nombre del profesor (opcional)
  color?: string;      // Color decimal o hex para la UI
  createdAt?: unknown; // Timestamp de creación
}
