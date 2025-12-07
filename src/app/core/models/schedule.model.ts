// schedule.model.ts
// Modelo para representar un horario en el frontend.
export interface Schedule {
  scheduleId: number;
  days: string; // Coincide con el campo 'days' del backend
  schedule: string; // Coincide con el campo 'schedule' del backend (ej. "06:30-08:30")
  available: boolean; // Mantener, aunque no viene del backend, se puede inferir o añadir
}

// Modelo para la creación/actualización de un horario (coincide con el DTO del backend)
export interface ScheduleDTO {
  days: string; // Cambiado de 'day' a 'days'
  schedule: string; // Combinación de startTime y endTime
  // 'available' no es parte del DTO de creación/actualización del backend
}
