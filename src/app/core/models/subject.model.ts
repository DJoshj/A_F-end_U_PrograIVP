export interface SubjectModel {
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

export interface SubjectAssignedDTO {
  subjectId: number;
  teacherId: number;
  periodId: number;
  scheduleId: number;
  classroomId: number;
  maximumCapacity: number;
  section: string;
}
