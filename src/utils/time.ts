/**
 * Convierte una cadena "HH:mm" en minutos totales desde el inicio del día.
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Verifica si dos rangos de tiempo se solapan.
 */
export const isTimeOverlap = (
  s1: string, e1: string,
  s2: string, e2: string
): boolean => {
  const start1 = timeToMinutes(s1);
  const end1 = timeToMinutes(e1);
  const start2 = timeToMinutes(s2);
  const end2 = timeToMinutes(e2);

  // Hay traslape si (Inicio1 < Fin2) Y (Fin1 > Inicio2)
  return start1 < end2 && end1 > start2;
};

/**
 * Detecta conflictos entre dos clases basándose en días y horas.
 */
export const checkTimeConflict = (
  dias1: string[], inicio1: string, fin1: string,
  dias2: string[], inicio2: string, fin2: string
): boolean => {
  // Primero verificamos si comparten días
  const commonDays = dias1.filter(day => dias2.includes(day));
  if (commonDays.length === 0) return false;

  // Si comparten días, verificamos el traslape de horas
  return isTimeOverlap(inicio1, fin1, inicio2, fin2);
};
