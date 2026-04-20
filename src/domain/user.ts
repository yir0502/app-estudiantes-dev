export type UserRole = "estudiante" | "profesor" | "admin";

export type BaseUserProfile = {
  uid: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  createdAt?: unknown;
};

export type PlanEstudio = 'Anterior 2016' | '2016-2023' | '2024';

export type EstudianteProfile = BaseUserProfile & {
  rol: "estudiante";
  matricula?: string;
  carrera?: string;
  semestre?: number | null;
  areaInteres?: string;
  planEstudio?: PlanEstudio;
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