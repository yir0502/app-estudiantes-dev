import { UserRole } from "@/src/domain/user";

export function isAdmin(role?: UserRole) {
  return role === "admin";
}

export function isProfesor(role?: UserRole) {
  return role === "profesor";
}

export function isEstudiante(role?: UserRole) {
  return role === "estudiante";
}