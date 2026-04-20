export type TaskPriority = "baja" | "media" | "alta";

export interface Task {
  id: string;              // ID único (ID de Firestore)
  userId: string;          // Dueño de la tarea
  titulo: string;          // Nombre corto de la tarea
  descripcion: string;     // Descripción detallada
  materiaId: string;       // ID de la materia (ClassId en el nuevo modelo)
  materiaNombre?: string;  
  fechaEntrega: any;       
  prioridad: TaskPriority; 
  completada: boolean;     
  tipo?: string;           // Examen, Trabajo, Proyecto
  entregableTipo?: "github" | "archivo" | "url" | "otro"; // Tipo de entregable
  entregableUrl?: string;  // Link a GitHub, URL de archivo, etc.
  createdAt: unknown;      
}
