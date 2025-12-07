// assigned-schedule.model.ts
// Modelo para representar una materia asignada con detalles de horario, aula, etc.
export interface AssignedSchedule {
  subjectAssignedId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  teacherCode: string;
  periodId: number;
  periodName: string;
  scheduleId: number;
  scheduleDays: string;
  scheduleTime: string;
  classroomId: number;
  classroomName: string;
  building: string;
  section: string;
  availableSpace: number;
  maximumCapacity: number;
  enrolledStudents: number;
}
