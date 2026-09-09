import { CATEGORY_COLORS } from '../theme/colors';

export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  signatureData: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface Section {
  id: number;
  academicYearId: number;
  subjectId: number;
  teacherId: number;
  name: string;
  classCode: string;
  enrollmentMode: 'approval' | 'auto';
  status: 'active' | 'inactive';
  academicYearName?: string;
  subjectName?: string;
  subjectCode?: string;
  studentCount?: number;
}

export interface Student {
  id: number;
  userId: number | null;
  studentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  status: 'active' | 'archived';
}

export interface Enrollment {
  id: number;
  studentId: number;
  sectionId: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'dropped' | 'revoked';
  studentName?: string;
  studentNumber?: string;
}

export type RecordCategory = 'ATTENDANCE' | 'LABORATORY' | 'QUIZ' | 'EXAM' | 'ASSIGNMENT';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type AssignmentStatus = 'Submitted' | 'Late' | 'Missing' | 'Excused' | 'Not yet submitted';
export type ExamType = 'Midterm' | 'Final';
export type QuizType = 'Quiz' | 'Short Quiz';
export type AssignmentType = 'Assignment' | 'Case Study' | 'Other';
export type ParticipationType = 'Active' | 'Passive' | 'Outstanding' | 'N/A';

export type RecordStatus = 'draft' | 'ready_to_sign' | 'signed' | 'locked' | 'corrected' | 'archived';

export interface StudentRecord {
  id: number;
  studentId: number;
  sectionId: number;
  category: RecordCategory;
  recordType: string;
  title: string;
  date: string;
  score: number | null;
  totalScore: number | null;
  percentage: number | null;
  status: RecordStatus;
  remarks: string;
  attendanceStatus: string | null;
  timeIn: string | null;
  timeOut: string | null;
  dueDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  signedBy: number | null;
  signedAt: string | null;
  signatureData: string | null;
  lockedAt: string | null;
}

export interface AuditLog {
  id: number;
  recordId: number | null;
  actorId: number;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
  reason: string;
}

export interface CardInfo {
  category: RecordCategory;
  label: string;
  icon: string;
  color: string;
  recordCount: number;
}

export const CARD_CONFIG: CardInfo[] = [
  { category: 'ATTENDANCE', label: 'Attendance', icon: 'calendar-check', color: CATEGORY_COLORS.ATTENDANCE, recordCount: 0 },
  { category: 'LABORATORY', label: 'Laboratory / Participation', icon: 'flask', color: CATEGORY_COLORS.LABORATORY, recordCount: 0 },
  { category: 'QUIZ', label: 'Quizzes', icon: 'clipboard-check', color: CATEGORY_COLORS.QUIZ, recordCount: 0 },
  { category: 'EXAM', label: 'Exams', icon: 'file-document', color: CATEGORY_COLORS.EXAM, recordCount: 0 },
  { category: 'ASSIGNMENT', label: 'Assignments', icon: 'book-open', color: CATEGORY_COLORS.ASSIGNMENT, recordCount: 0 },
];

export const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused'];
export const ASSIGNMENT_STATUS_OPTIONS: AssignmentStatus[] = ['Submitted', 'Late', 'Missing', 'Excused', 'Not yet submitted'];
export const EXAM_TYPES: ExamType[] = ['Midterm', 'Final'];
export const QUIZ_TYPES: QuizType[] = ['Quiz', 'Short Quiz'];
export const ASSIGNMENT_TYPES: AssignmentType[] = ['Assignment', 'Case Study', 'Other'];
export const PARTICIPATION_TYPES: ParticipationType[] = ['Active', 'Passive', 'Outstanding', 'N/A'];
