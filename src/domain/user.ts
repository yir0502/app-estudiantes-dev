export type UserRole = "estudiante" | "profesor" | "admin";

export type BaseUserProfile = {
  uid: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  createdAt?: unknown;
};

export type EstudianteProfile = BaseUserProfile & {
  rol: "estudiante";
  matricula?: string;
  carrera?: string;
  semestre?: number | null;
  areaInteres?: string;
};

export type ProfesorProfile = BaseUserProfile & {
  rol: "profesor";
  numeroEmpleado?: string;
  departamento?: string;
  materiasAsignadas?: string[];
};

export type AdminProfile = BaseUserProfile & {
  rol: "admin";
  area?: string;
  permisos?: string[];
};

export type UserProfile = EstudianteProfile | ProfesorProfile | AdminProfile;