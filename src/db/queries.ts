import type { SupabaseClient } from '@supabase/supabase-js';
import * as Online from './queriesOnline';
import {
  cacheKey,
  getCacheEntry,
  setCacheEntry,
  invalidateCache,
  initOfflineEngine,
} from './offline';
import {
  User,
  AcademicYear,
  Subject,
  Section,
  Student,
  Enrollment,
  StudentRecord,
  RecordCategory,
  AuditLog,
} from '../types';

export type Db = SupabaseClient;

export const mapSection = Online.mapSection;

// Re-export for screens that reference these types implicitly
export type { User, AcademicYear, Subject, Section, Student, Enrollment, StudentRecord, RecordCategory, AuditLog };

// ---------------------------------------------------------------------------
// Online + queue plumbing
// ---------------------------------------------------------------------------
let engineStarted = false;
export function initOffline() {
  if (!engineStarted) {
    engineStarted = true;
    initOfflineEngine();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function readCached<T>(key: string): Promise<T | null> {
  return getCacheEntry<T>(key);
}

async function writeCached(key: string, value: unknown) {
  await setCacheEntry(key, value);
}

async function bust(...keys: string[]) {
  await invalidateCache(...keys);
}

// ---------------------------------------------------------------------------
// Auth + Users
// ---------------------------------------------------------------------------
export async function createUser(
  db: Db,
  name: string,
  email: string,
  pin: string,
  role: 'teacher' | 'student' = 'teacher'
): Promise<User> {
  const user = await Online.createUser(db, name, email, pin, role);
  await bust(cacheKey('academicYears'), cacheKey('users'));
  return user;
}

export async function loginByPin(
  db: Db,
  email: string,
  pin: string
): Promise<User | null> {
  return Online.loginByPin(db, email, pin);
}

export const getUserById = async (
  db: Db,
  id: number
): Promise<User | null> => {
  const key = cacheKey('user', id);
  const cached = await readCached<User | null>(key);
  if (cached !== null) return cached;
  const u = await Online.getUserById(db, id);
  if (u) await writeCached(key, u);
  return u;
};

export async function updateUser(
  db: Db,
  id: number,
  data: Partial<Pick<User, 'name' | 'email' | 'pin' | 'signatureData'>>
): Promise<void> {
  await Online.updateUser(db, id, data);
  await bust(cacheKey('user', id));
}

// ---------------------------------------------------------------------------
// Academic Years
// ---------------------------------------------------------------------------
export async function getAcademicYears(db: Db): Promise<AcademicYear[]> {
  const key = cacheKey('academicYears');
  const cached = await readCached<AcademicYear[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getAcademicYears(db);
  await writeCached(key, rows);
  return rows;
}

export async function getActiveAcademicYear(
  db: Db
): Promise<AcademicYear | null> {
  const key = cacheKey('activeAcademicYear');
  const cached = await readCached<AcademicYear | null>(key);
  if (cached !== null) return cached;
  const row = await Online.getActiveAcademicYear(db);
  if (row) await writeCached(key, row);
  return row;
}

export async function createAcademicYear(
  db: Db,
  name: string,
  startDate: string,
  endDate: string
): Promise<AcademicYear> {
  const row = await Online.createAcademicYear(db, name, startDate, endDate);
  await bust(cacheKey('academicYears'), cacheKey('activeAcademicYear'));
  return row;
}

export async function updateAcademicYearStatus(
  db: Db,
  id: number,
  status: 'active' | 'inactive'
): Promise<void> {
  await Online.updateAcademicYearStatus(db, id, status);
  await bust(cacheKey('academicYears'), cacheKey('activeAcademicYear'));
}

export async function deleteAcademicYear(db: Db, id: number): Promise<void> {
  await Online.deleteAcademicYear(db, id);
  await bust(cacheKey('academicYears'), cacheKey('activeAcademicYear'));
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------
export async function getSubjects(db: Db): Promise<Subject[]> {
  const key = cacheKey('subjects');
  const cached = await readCached<Subject[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getSubjects(db);
  await writeCached(key, rows);
  return rows;
}

export async function getSubjectById(db: Db, id: number): Promise<Subject | null> {
  const key = cacheKey('subject', id);
  const cached = await readCached<Subject | null>(key);
  if (cached !== null) return cached;
  const s = await Online.getSubjectById(db, id);
  if (s) await writeCached(key, s);
  return s;
}

export async function createSubject(
  db: Db,
  code: string,
  name: string,
  description: string
): Promise<Subject> {
  const s = await Online.createSubject(db, code, name, description);
  await bust(cacheKey('subjects'));
  return s;
}

export async function updateSubject(
  db: Db,
  id: number,
  code: string,
  name: string,
  description: string
): Promise<void> {
  await Online.updateSubject(db, id, code, name, description);
  await bust(cacheKey('subjects'), cacheKey('subject', id));
}

export async function deleteSubject(db: Db, id: number): Promise<void> {
  await Online.deleteSubject(db, id);
  await bust(cacheKey('subjects'), cacheKey('subject', id));
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export async function getSectionsByTeacher(
  db: Db,
  teacherId: number,
  academicYearId?: number
): Promise<Section[]> {
  const key = cacheKey('sectionsByTeacher', teacherId, academicYearId ?? '');
  const cached = await readCached<Section[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getSectionsByTeacher(db, teacherId, academicYearId);
  await writeCached(key, rows);
  return rows;
}

export async function getSectionById(db: Db, sectionId: number): Promise<Section | null> {
  const key = cacheKey('section', sectionId);
  const cached = await readCached<Section | null>(key);
  if (cached !== null) return cached;
  const s = await Online.getSectionById(db, sectionId);
  if (s) await writeCached(key, s);
  return s;
}

export async function createSection(
  db: Db,
  academicYearId: number,
  subjectId: number,
  teacherId: number,
  name: string
): Promise<Section> {
  const s = await Online.createSection(db, academicYearId, subjectId, teacherId, name);
  await bust(cacheKey('sectionsByTeacher', teacherId), cacheKey('section'));
  return s;
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
export async function getStudentsBySection(db: Db, sectionId: number): Promise<Student[]> {
  const key = cacheKey('studentsBySection', sectionId);
  const cached = await readCached<Student[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getStudentsBySection(db, sectionId);
  await writeCached(key, rows);
  return rows;
}

export async function getStudentById(db: Db, studentId: number): Promise<Student | null> {
  const key = cacheKey('student', studentId);
  const cached = await readCached<Student | null>(key);
  if (cached !== null) return cached;
  const s = await Online.getStudentById(db, studentId);
  if (s) await writeCached(key, s);
  return s;
}

export async function getStudentByUserId(db: Db, userId: number): Promise<Student | null> {
  const key = cacheKey('studentByUserId', userId);
  const cached = await readCached<Student | null>(key);
  if (cached !== null) return cached;
  const s = await Online.getStudentByUserId(db, userId);
  if (s) await writeCached(key, s);
  return s;
}

export async function createStudent(
  db: Db,
  studentNumber: string,
  firstName: string,
  middleName: string,
  lastName: string
): Promise<Student> {
  const s = await Online.createStudent(db, studentNumber, firstName, middleName, lastName);
  await bust(cacheKey('studentsBySection'));
  return s;
}

export async function registerStudent(
  db: Db,
  name: string,
  studentNumber: string,
  email: string,
  pin: string
): Promise<User> {
  return Online.registerStudent(db, name, studentNumber, email, pin);
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------
export async function enrollStudent(
  db: Db,
  studentId: number,
  sectionId: number,
  status: 'pending' | 'active' = 'active'
): Promise<Enrollment> {
  const e = await Online.enrollStudent(db, studentId, sectionId, status);
  await bust(cacheKey('studentsBySection', sectionId), cacheKey('studentEnrollments', studentId));
  return e;
}

export async function getEnrollmentRequests(db: Db, sectionId: number): Promise<Enrollment[]> {
  const key = cacheKey('enrollmentRequests', sectionId);
  const cached = await readCached<Enrollment[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getEnrollmentRequests(db, sectionId);
  await writeCached(key, rows);
  return rows;
}

export async function approveEnrollment(db: Db, enrollmentId: number): Promise<void> {
  await Online.approveEnrollment(db, enrollmentId);
  await bust(cacheKey('enrollmentRequests'));
}

export async function rejectEnrollment(db: Db, enrollmentId: number): Promise<void> {
  await Online.rejectEnrollment(db, enrollmentId);
  await bust(cacheKey('enrollmentRequests'));
}

export async function approveAllEnrollments(db: Db, sectionId: number): Promise<void> {
  await Online.approveAllEnrollments(db, sectionId);
  await bust(cacheKey('enrollmentRequests'), cacheKey('studentsBySection', sectionId));
}

export async function getStudentSections(db: Db, studentId: number): Promise<Section[]> {
  const key = cacheKey('studentSections', studentId);
  const cached = await readCached<Section[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getStudentSections(db, studentId);
  await writeCached(key, rows);
  return rows;
}

export async function getStudentEnrollments(
  db: Db,
  studentId: number
): Promise<(Enrollment & { sectionName: string; subjectName: string; subjectCode: string })[]> {
  const key = cacheKey('studentEnrollments', studentId);
  const cached = await readCached<(Enrollment & { sectionName: string; subjectName: string; subjectCode: string })[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getStudentEnrollments(db, studentId);
  await writeCached(key, rows);
  return rows;
}

export async function joinSectionByClassCode(
  db: Db,
  studentId: number,
  classCode: string
): Promise<{ section: Section; status: 'pending' | 'active' }> {
  const r = await Online.joinSectionByClassCode(db, studentId, classCode);
  await bust(cacheKey('studentSections', studentId), cacheKey('studentEnrollments', studentId));
  return r;
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------
export async function createRecord(
  db: Db,
  data: Parameters<typeof Online.createRecord>[1]
): Promise<StudentRecord> {
  const r = await Online.createRecord(db, data);
  await bust(
    cacheKey('recordsBySection', data.sectionId),
    cacheKey('recordsByStudentSection', data.studentId, data.sectionId)
  );
  return r;
}

export async function createBulkRecords(
  db: Db,
  records: Parameters<typeof Online.createBulkRecords>[1]
): Promise<void> {
  await Online.createBulkRecords(db, records);
  const sectionIds = [...new Set(records.map((r) => r.sectionId))];
  await bust(...sectionIds.map((s) => cacheKey('recordsBySection', s)));
}

export async function getRecordsBySection(
  db: Db,
  sectionId: number,
  category?: RecordCategory
): Promise<StudentRecord[]> {
  const key = cacheKey('recordsBySection', sectionId, category ?? '');
  const cached = await readCached<StudentRecord[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getRecordsBySection(db, sectionId, category);
  await writeCached(key, rows);
  return rows;
}

export async function getRecordsByStudentAndSection(
  db: Db,
  studentId: number,
  sectionId: number
): Promise<StudentRecord[]> {
  const key = cacheKey('recordsByStudentSection', studentId, sectionId);
  const cached = await readCached<StudentRecord[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getRecordsByStudentAndSection(db, studentId, sectionId);
  await writeCached(key, rows);
  return rows;
}

export async function getRecordById(db: Db, recordId: number): Promise<StudentRecord | null> {
  const key = cacheKey('record', recordId);
  const cached = await readCached<StudentRecord | null>(key);
  if (cached !== null) return cached;
  const r = await Online.getRecordById(db, recordId);
  if (r) await writeCached(key, r);
  return r;
}

export async function updateRecord(
  db: Db,
  id: number,
  data: Parameters<typeof Online.updateRecord>[2]
): Promise<void> {
  await Online.updateRecord(db, id, data);
  await bust(cacheKey('record', id), cacheKey('recordsBySection'));
}

export async function signRecord(
  db: Db,
  recordId: number,
  userId: number,
  signatureData: string
): Promise<void> {
  await Online.signRecord(db, recordId, userId, signatureData);
  await bust(cacheKey('record', recordId), cacheKey('recordsBySection'));
}

export async function signBulkRecords(
  db: Db,
  recordIds: number[],
  userId: number,
  signatureData: string
): Promise<void> {
  await Online.signBulkRecords(db, recordIds, userId, signatureData);
  await bust(cacheKey('recordsBySection'));
}

export async function getUnsignedRecords(
  db: Db,
  teacherId: number
): Promise<(StudentRecord & { studentName: string; sectionName: string })[]> {
  const key = cacheKey('unsignedRecords', teacherId);
  const cached = await readCached<(StudentRecord & { studentName: string; sectionName: string })[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getUnsignedRecords(db, teacherId);
  await writeCached(key, rows);
  return rows;
}

export async function getStudentTimeline(
  db: Db,
  studentId: number,
  filters?: { category?: RecordCategory; startDate?: string; endDate?: string }
): Promise<StudentRecord[]> {
  const key = cacheKey('studentTimeline', studentId, filters ? hash(filters) : '');
  const cached = await readCached<StudentRecord[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getStudentTimeline(db, studentId, filters);
  await writeCached(key, rows);
  return rows;
}

// ---------------------------------------------------------------------------
// Aggregations (re-derive live; fall back to cached base rows when offline)
// ---------------------------------------------------------------------------
export async function getDashboardStats(
  db: Db,
  teacherId: number,
  academicYearId?: number
): Promise<Awaited<ReturnType<typeof Online.getDashboardStats>>> {
  const cachedSections = await readCached<Section[]>(
    cacheKey('sectionsByTeacher', teacherId, academicYearId ?? '')
  );
  try {
    return await Online.getDashboardStats(db, teacherId, academicYearId);
  } catch {
    if (cachedSections) {
      return {
        sections: cachedSections,
        totalStudents: cachedSections.reduce((s, x) => s + (x.studentCount ?? 0), 0),
        unsignedRecords: 0,
        recentRecords: [],
      };
    }
    throw new Error('Offline: no cached dashboard data');
  }
}

export async function searchStudents(
  db: Db,
  query: string,
  sectionId?: number
): Promise<(Student & { sectionNames?: string })[]> {
  try {
    return await Online.searchStudents(db, query, sectionId);
  } catch {
    const key = cacheKey('studentsBySection', sectionId ?? 'all');
    const cached = await readCached<Student[]>(key);
    if (cached) {
      const q = query.toLowerCase();
      return cached.filter((s) =>
        `${s.firstName} ${s.lastName} ${s.studentNumber}`.toLowerCase().includes(q)
      );
    }
    return [];
  }
}

// Derived summaries: try online; on failure recompute from cached base rows.
function cachedByStudent(rows: StudentRecord[], studentId: number, sectionId?: number) {
  return rows.filter(
    (r) => r.studentId === studentId && (sectionId == null || r.sectionId === sectionId)
  );
}

export async function getStudentSummary(
  db: Db,
  studentId: number,
  sectionId?: number
): Promise<Awaited<ReturnType<typeof Online.getStudentSummary>>> {
  try {
    return await Online.getStudentSummary(db, studentId, sectionId);
  } catch {
    const rows = await cachedRecordsForStudent(db, studentId, sectionId);
    return summaryFromRecords(rows);
  }
}

export async function getSectionSummary(
  db: Db,
  sectionId: number
): Promise<Awaited<ReturnType<typeof Online.getSectionSummary>>> {
  try {
    return await Online.getSectionSummary(db, sectionId);
  } catch {
    const rows =
      (await readCached<StudentRecord[]>(cacheKey('recordsBySection', sectionId))) ?? [];
    return summarizeSection(rows, sectionId, db);
  }
}

// helpers (kept small)
function hash(f: Record<string, any>): string {
  let s = '';
  for (const k of ['category', 'startDate', 'endDate']) if (f[k]) s += `${k}${f[k]}`;
  return s;
}

async function cachedRecordsForStudent(
  db: Db,
  studentId: number,
  sectionId?: number
): Promise<StudentRecord[]> {
  const direct = await readCached<StudentRecord[]>(
    cacheKey('recordsByStudentSection', studentId, sectionId ?? '')
  );
  if (direct) return direct;
  if (sectionId == null) {
    const sections = await readCached<Section[]>(cacheKey('studentSections', studentId));
    if (sections) {
      const out: StudentRecord[] = [];
      for (const s of sections) {
        const r = await readCached<StudentRecord[]>(cacheKey('recordsByStudentSection', studentId, s.id));
        if (r) out.push(...r);
      }
      return out;
    }
  }
  return [];
}

function summaryFromRecords(rows: StudentRecord[]): Awaited<
  ReturnType<typeof Online.getStudentSummary>
> {
  const map = new Map<string, { count: number; sum: number | null; signedCount: number }>();
  for (const r of rows) {
    const e = map.get(r.category) ?? { count: 0, sum: null as number | null, signedCount: 0 };
    e.count += 1;
    if (r.percentage != null) e.sum = (e.sum ?? 0) + r.percentage;
    if (r.status === 'signed' || r.status === 'locked') e.signedCount += 1;
    map.set(r.category, e);
  }
  const totalCount = rows.length;
  return {
    byCategory: [...map.entries()].map(([category, v]) => ({
      category,
      count: v.count,
      avgScore: v.sum != null ? v.sum / v.count : null,
      signedCount: v.signedCount,
    })),
    total: { count: totalCount, signedCount: rows.filter((r) => r.status === 'signed' || r.status === 'locked').length },
  };
}

async function summarizeSection(
  rows: StudentRecord[],
  sectionId: number,
  db: Db
): Promise<Awaited<ReturnType<typeof Online.getSectionSummary>>> {
  const map = new Map<string, { count: number; sum: number | null; signedCount: number }>();
  for (const r of rows) {
    const e = map.get(r.category) ?? { count: 0, sum: null as number | null, signedCount: 0 };
    e.count += 1;
    if (r.percentage != null) e.sum = (e.sum ?? 0) + r.percentage;
    if (r.status === 'signed' || r.status === 'locked') e.signedCount += 1;
    map.set(r.category, e);
  }
  const students =
    (await readCached<Student[]>(cacheKey('studentsBySection', sectionId))) ?? [];
  return {
    studentCount: students.length,
    byCategory: [...map.entries()].map(([category, v]) => ({
      category,
      count: v.count,
      avgScore: v.sum != null ? v.sum / v.count : null,
      signedCount: v.signedCount,
    })),
    total: { count: rows.length, signedCount: rows.filter((r) => r.status === 'signed' || r.status === 'locked').length },
  };
}

export async function getRecordCountByCategory(
  db: Db,
  studentId: number,
  sectionId: number
): Promise<Record<string, number>> {
  try {
    return await Online.getRecordCountByCategory(db, studentId, sectionId);
  } catch {
    const rows = (await readCached<StudentRecord[]>(
      cacheKey('recordsByStudentSection', studentId, sectionId)
    )) ?? [];
    const counts: Record<string, number> = { ATTENDANCE: 0, LABORATORY: 0, QUIZ: 0, EXAM: 0, ASSIGNMENT: 0 };
    for (const r of rows) {
      if (counts[r.category] !== undefined && (r.status === 'signed' || r.status === 'locked')) {
        counts[r.category] += 1;
      }
    }
    return counts;
  }
}

export async function getAttendanceSummary(
  db: Db,
  sectionId: number,
  startDate?: string,
  endDate?: string
): Promise<Awaited<ReturnType<typeof Online.getAttendanceSummary>>> {
  try {
    const v = await Online.getAttendanceSummary(db, sectionId, startDate, endDate);
    return v;
  } catch {
    const rows = (await readCached<StudentRecord[]>(cacheKey('recordsBySection', sectionId))) ?? [];
    const overall = new Map<string, number>();
    for (const r of rows) {
      if (r.category !== 'ATTENDANCE') continue;
      const st = r.attendanceStatus ?? 'Unknown';
      overall.set(st, (overall.get(st) ?? 0) + 1);
    }
    return {
      overall: [...overall.entries()].map(([attendanceStatus, count]) => ({ attendanceStatus, count })),
      byStudent: [],
    };
  }
}

async function summaryWrapper(
  db: Db,
  sectionId: number,
  online: (db: Db, sectionId: number) => Promise<any>,
  derive: (rows: StudentRecord[]) => any
) {
  try {
    return await online(db, sectionId);
  } catch {
    const rows = (await readCached<StudentRecord[]>(cacheKey('recordsBySection', sectionId))) ?? [];
    return derive(rows);
  }
}

export const getQuizSummary = (db: Db, sectionId: number) =>
  summaryWrapper(db, sectionId, Online.getQuizSummary, (rows) => ({
    byStudent: groupCounts(rows, 'QUIZ'),
  }));

export const getLabSummary = (db: Db, sectionId: number) =>
  summaryWrapper(db, sectionId, Online.getLabSummary, (rows) => ({
    byStudent: groupCounts(rows, 'LABORATORY'),
  }));

export const getExamSummary = (db: Db, sectionId: number) =>
  summaryWrapper(db, sectionId, Online.getExamSummary, (rows) => ({
    byStudent: groupCounts(rows, 'EXAM'),
  }));

export const getAssignmentSummary = (db: Db, sectionId: number) =>
  summaryWrapper(db, sectionId, Online.getAssignmentSummary, (rows) => {
    const byStudent: any[] = [];
    // offline fallback: minimal
    return { byStudent };
  });

function groupCounts(rows: StudentRecord[], category: RecordCategory) {
  const map = new Map<number, { name: string; count: number; sumScore: number | null; sumPct: number | null }>();
  for (const r of rows) {
    if (r.category !== category) continue;
    const e = map.get(r.studentId) ?? { name: r.remarks || `Student ${r.studentId}`, count: 0, sumScore: null, sumPct: null };
    e.count += 1;
    if (r.score != null) e.sumScore = (e.sumScore ?? 0) + r.score;
    if (r.percentage != null) e.sumPct = (e.sumPct ?? 0) + r.percentage;
    map.set(r.studentId, e);
  }
  return [...map.values()].map((r) => ({
    studentId: 0,
    studentName: r.name,
    count: r.count,
    avgScore: r.sumScore != null ? r.sumScore / r.count : null,
    avgPercentage: r.sumPct != null ? r.sumPct / r.count : null,
  }));
}

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------
export async function createAuditLog(
  db: Db,
  recordId: number | null,
  actorId: number,
  action: string,
  oldValue: string | null,
  newValue: string | null,
  reason: string
): Promise<void> {
  await Online.createAuditLog(db, recordId, actorId, action, oldValue, newValue, reason);
}

export async function getAuditLogs(db: Db, recordId: number): Promise<AuditLog[]> {
  const key = cacheKey('auditLogs', recordId);
  const cached = await readCached<AuditLog[]>(key);
  if (cached !== null) return cached;
  const rows = await Online.getAuditLogs(db, recordId);
  await writeCached(key, rows);
  return rows;
}