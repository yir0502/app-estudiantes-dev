import { PlanEstudio } from "./user";

export interface PlanSubject {
  id: string;         // ID local, ej: 'b1', 'b2'
  codigo: string;     // Código académico, ej: 'ALG101'
  materia: string;    // Nombre exacto que debe coincidir con ClassModel.materia
  creditos: number;
  semestre: number;
}

export interface StudyPlanModel {
  nombre: PlanEstudio;
  descripcion: string;
  materias: PlanSubject[];
}

export const STUDY_PLANS: Record<PlanEstudio, StudyPlanModel> = {
  'Anterior 2016': {
    nombre: 'Anterior 2016',
    descripcion: 'Plan de estudios tradicional con enfoque en ciencias básicas.',
    materias: [
      { id: 'a1', codigo: 'MAT101', materia: 'Cálculo Diferencial', creditos: 6, semestre: 1 },
      { id: 'a2', codigo: 'FIS101', materia: 'Física I', creditos: 6, semestre: 1 },
      { id: 'a3', codigo: 'PROG101', materia: 'Programación I', creditos: 8, semestre: 1 },
      { id: 'a4', codigo: 'MAT102', materia: 'Cálculo Integral', creditos: 6, semestre: 2 },
      { id: 'a5', codigo: 'QUI101', materia: 'Química General', creditos: 4, semestre: 2 },
    ]
  },
  '2016-2023': {
    nombre: '2016-2023',
    descripcion: 'Plan basado en competencias y formación integral.',
    materias: [
      { id: 'b1', codigo: 'ALG101', materia: 'Álgebra Lineal', creditos: 5, semestre: 1 },
      { id: 'b2', codigo: 'INT101', materia: 'Introducción a la Ing.', creditos: 3, semestre: 1 },
      { id: 'b3', codigo: 'CAL101', materia: 'Cálculo Diferencial', creditos: 6, semestre: 1 },
      { id: 'b4', codigo: 'CAL102', materia: 'Cálculo Integral', creditos: 6, semestre: 2 },
      { id: 'b5', codigo: 'DIN101', materia: 'Dinámica', creditos: 5, semestre: 2 },
      { id: 'b6', codigo: 'EST101', materia: 'Estadística', creditos: 4, semestre: 3 },
    ]
  },
  '2024': {
    nombre: '2024',
    descripcion: 'Nuevo plan actualizado con enfoque en IA y sustentabilidad.',
    materias: [
      { id: 'c1', codigo: 'PEN101', materia: 'Pensamiento Algorítmico', creditos: 6, semestre: 1 },
      { id: 'c2', codigo: 'MAT101', materia: 'Matemáticas para la IA', creditos: 6, semestre: 1 },
      { id: 'c3', codigo: 'SUS101', materia: 'Sustentabilidad', creditos: 4, semestre: 1 },
      { id: 'c4', codigo: 'CIEN101', materia: 'Ciencia de Datos I', creditos: 8, semestre: 2 },
      { id: 'c5', codigo: 'ARQ101', materia: 'Arquitectura de Software', creditos: 6, semestre: 2 },
    ]
  }
};
