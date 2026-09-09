import { SQLiteDatabase } from 'expo-sqlite';
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

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createUser(
  db: SQLiteDatabase,
  name: string,
  email: string,
  pin: string,
  role: 'teacher' | 'student' = 'teacher'
): Promise<User> {
  const result = await db.runAsync(
    'INSERT INTO users (name, email, pin, role) VALUES (?, ?, ?, ?)',
    [name, email, pin, role]
  );
  const user = await db.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [result.lastInsertRowId]
  );
  return user!;
}

export async function loginByPin(
  db: SQLiteDatabase,
  email: string,
  pin: string
): Promise<User | null> {
  const user = await db.getFirstAsync<User>(
    "SELECT * FROM users WHERE email = ? AND pin = ? AND status = 'active'",
    [email, pin]
  );
  return user ?? null;
}

export async function getUserById(
  db: SQLiteDatabase,
  id: number
): Promise<User | null> {
  return db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', [id]);
}

export async function updateUser(
  db: SQLiteDatabase,
  id: number,
  data: Partial<Pick<User, 'name' | 'email' | 'pin' | 'signatureData'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
  if (data.pin !== undefined) { fields.push('pin = ?'); values.push(data.pin); }
  if (data.signatureData !== undefined) { fields.push('signatureData = ?'); values.push(data.signatureData); }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function getAcademicYears(
  db: SQLiteDatabase
): Promise<AcademicYear[]> {
  return db.getAllAsync<AcademicYear>(
    'SELECT * FROM academic_years ORDER BY startDate DESC'
  );
}

export async function getActiveAcademicYear(
  db: SQLiteDatabase
): Promise<AcademicYear | null> {
  return db.getFirstAsync<AcademicYear>(
    "SELECT * FROM academic_years WHERE status = 'active' ORDER BY startDate DESC LIMIT 1"
  );
}

export async function createAcademicYear(
  db: SQLiteDatabase,
  name: string,
  startDate: string,
  endDate: string
): Promise<AcademicYear> {
  const result = await db.runAsync(
    'INSERT INTO academic_years (name, startDate, endDate) VALUES (?, ?, ?)',
    [name, startDate, endDate]
  );
  return (await db.getFirstAsync<AcademicYear>(
    'SELECT * FROM academic_years WHERE id = ?',
    [result.lastInsertRowId]
  ))!;
}

export async function updateAcademicYearStatus(
  db: SQLiteDatabase,
  id: number,
  status: 'active' | 'inactive'
): Promise<void> {
  await db.runAsync('UPDATE academic_years SET status = ? WHERE id = ?', [
    status,
    id,
  ]);
}

export async function deleteAcademicYear(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM academic_years WHERE id = ?', [id]);
}

export async function getSubjects(db: SQLiteDatabase): Promise<Subject[]> {
  return db.getAllAsync<Subject>('SELECT * FROM subjects ORDER BY code');
}

export async function getSubjectById(
  db: SQLiteDatabase,
  id: number
): Promise<Subject | null> {
  return db.getFirstAsync<Subject>('SELECT * FROM subjects WHERE id = ?', [id]);
}

export async function createSubject(
  db: SQLiteDatabase,
  code: string,
  name: string,
  description: string
): Promise<Subject> {
  const result = await db.runAsync(
    'INSERT INTO subjects (code, name, description) VALUES (?, ?, ?)',
    [code, name, description]
  );
  return (await db.getFirstAsync<Subject>(
    'SELECT * FROM subjects WHERE id = ?',
    [result.lastInsertRowId]
  ))!;
}

export async function updateSubject(
  db: SQLiteDatabase,
  id: number,
  code: string,
  name: string,
  description: string
): Promise<void> {
  await db.runAsync(
    'UPDATE subjects SET code = ?, name = ?, description = ? WHERE id = ?',
    [code, name, description, id]
  );
}

export async function deleteSubject(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM subjects WHERE id = ?', [id]);
}

export async function getSectionsByTeacher(
  db: SQLiteDatabase,
  teacherId: number,
  academicYearId?: number
): Promise<Section[]> {
  if (academicYearId) {
    return db.getAllAsync<Section>(
      `SELECT s.*, ay.name as academicYearName, sub.name as subjectName, sub.code as subjectCode,
        (SELECT COUNT(*) FROM enrollments e WHERE e.sectionId = s.id AND e.status = 'active') as studentCount
       FROM sections s
       JOIN academic_years ay ON s.academicYearId = ay.id
       JOIN subjects sub ON s.subjectId = sub.id
       WHERE s.teacherId = ? AND s.academicYearId = ? AND s.status = 'active'
       ORDER BY sub.code, s.name`,
      [teacherId, academicYearId]
    );
  }
  return db.getAllAsync<Section>(
    `SELECT s.*, ay.name as academicYearName, sub.name as subjectName, sub.code as subjectCode,
      (SELECT COUNT(*) FROM enrollments e WHERE e.sectionId = s.id AND e.status = 'active') as studentCount
     FROM sections s
     JOIN academic_years ay ON s.academicYearId = ay.id
     JOIN subjects sub ON s.subjectId = sub.id
     WHERE s.teacherId = ? AND s.status = 'active'
     ORDER BY ay.startDate DESC, sub.code, s.name`,
    [teacherId]
  );
}

export async function getSectionById(
  db: SQLiteDatabase,
  sectionId: number
): Promise<Section | null> {
  return db.getFirstAsync<Section>(
    `SELECT s.*, ay.name as academicYearName, sub.name as subjectName, sub.code as subjectCode,
      (SELECT COUNT(*) FROM enrollments e WHERE e.sectionId = s.id AND e.status = 'active') as studentCount
     FROM sections s
     JOIN academic_years ay ON s.academicYearId = ay.id
     JOIN subjects sub ON s.subjectId = sub.id
     WHERE s.id = ?`,
    [sectionId]
  );
}

export async function createSection(
  db: SQLiteDatabase,
  academicYearId: number,
  subjectId: number,
  teacherId: number,
  name: string
): Promise<Section> {
  let classCode = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM sections WHERE classCode = ?',
      [classCode]
    );
    if (!existing) break;
    classCode = generateCode();
    attempts++;
  }
  const result = await db.runAsync(
    'INSERT INTO sections (academicYearId, subjectId, teacherId, name, classCode) VALUES (?, ?, ?, ?, ?)',
    [academicYearId, subjectId, teacherId, name, classCode]
  );
  return getSectionById(db, result.lastInsertRowId as number) as Promise<Section>;
}

export async function getStudentsBySection(
  db: SQLiteDatabase,
  sectionId: number
): Promise<Student[]> {
  return db.getAllAsync<Student>(
    `SELECT st.* FROM students st
     JOIN enrollments e ON st.id = e.studentId
     WHERE e.sectionId = ? AND e.status = 'active' AND st.status = 'active'
     ORDER BY st.lastName, st.firstName`,
    [sectionId]
  );
}

export async function getStudentById(
  db: SQLiteDatabase,
  studentId: number
): Promise<Student | null> {
  return db.getFirstAsync<Student>(
    'SELECT * FROM students WHERE id = ?',
    [studentId]
  );
}

export async function createStudent(
  db: SQLiteDatabase,
  studentNumber: string,
  firstName: string,
  middleName: string,
  lastName: string
): Promise<Student> {
  const existing = await db.getFirstAsync<Student>(
    'SELECT * FROM students WHERE studentNumber = ?',
    [studentNumber]
  );
  if (existing) return existing;
  const result = await db.runAsync(
    'INSERT INTO students (studentNumber, firstName, middleName, lastName) VALUES (?, ?, ?, ?)',
    [studentNumber, firstName, middleName, lastName]
  );
  return (await db.getFirstAsync<Student>(
    'SELECT * FROM students WHERE id = ?',
    [result.lastInsertRowId]
  ))!;
}

export async function enrollStudent(
  db: SQLiteDatabase,
  studentId: number,
  sectionId: number,
  status: 'pending' | 'active' = 'active'
): Promise<Enrollment> {
  const existing = await db.getFirstAsync<Enrollment>(
    'SELECT * FROM enrollments WHERE studentId = ? AND sectionId = ?',
    [studentId, sectionId]
  );
  if (existing) return existing;
  const result = await db.runAsync(
    "INSERT INTO enrollments (studentId, sectionId, status, effectiveFrom) VALUES (?, ?, ?, date('now'))",
    [studentId, sectionId, status]
  );
  return (await db.getFirstAsync<Enrollment>(
    'SELECT * FROM enrollments WHERE id = ?',
    [result.lastInsertRowId]
  ))!;
}

export async function getEnrollmentRequests(
  db: SQLiteDatabase,
  sectionId: number
): Promise<Enrollment[]> {
  return db.getAllAsync<Enrollment>(
    `SELECT e.*, st.firstName || ' ' || st.lastName as studentName, st.studentNumber
     FROM enrollments e
     JOIN students st ON e.studentId = st.id
     WHERE e.sectionId = ? AND e.status = 'pending'
     ORDER BY e.id`,
    [sectionId]
  );
}

export async function approveEnrollment(
  db: SQLiteDatabase,
  enrollmentId: number
): Promise<void> {
  await db.runAsync(
    "UPDATE enrollments SET status = 'active', effectiveFrom = date('now') WHERE id = ?",
    [enrollmentId]
  );
}

export async function rejectEnrollment(
  db: SQLiteDatabase,
  enrollmentId: number
): Promise<void> {
  await db.runAsync('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);
}

export async function approveAllEnrollments(
  db: SQLiteDatabase,
  sectionId: number
): Promise<void> {
  await db.runAsync(
    "UPDATE enrollments SET status = 'active', effectiveFrom = date('now') WHERE sectionId = ? AND status = 'pending'",
    [sectionId]
  );
}

export async function getStudentSections(
  db: SQLiteDatabase,
  studentId: number
): Promise<Section[]> {
  return db.getAllAsync<Section>(
    `SELECT s.*, ay.name as academicYearName, sub.name as subjectName, sub.code as subjectCode
     FROM sections s
     JOIN enrollments e ON s.id = e.sectionId
     JOIN academic_years ay ON s.academicYearId = ay.id
     JOIN subjects sub ON s.subjectId = sub.id
     WHERE e.studentId = ? AND e.status = 'active' AND s.status = 'active'
     ORDER BY ay.startDate DESC, sub.code`,
    [studentId]
  );
}

export async function registerStudent(
  db: SQLiteDatabase,
  name: string,
  studentNumber: string,
  email: string,
  pin: string
): Promise<User> {
  const names = name.trim().split(/\s+/);
  const firstName = names[0] ?? name.trim();
  const lastName = names.length > 1 ? names[names.length - 1] : name.trim();
  const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : '';

  const existingStudent = await db.getFirstAsync<Student>(
    'SELECT * FROM students WHERE studentNumber = ?',
    [studentNumber]
  );
  if (existingStudent) {
    throw new Error('A student with this student number already exists.');
  }

  let userId: number | undefined;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO users (name, email, pin, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email, pin, 'student']
    );
    userId = result.lastInsertRowId as number;

    await db.runAsync(
      `INSERT INTO students (userId, studentNumber, firstName, middleName, lastName)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, studentNumber, firstName, middleName, lastName]
    );
  });
  const user = await db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', [userId!]);
  return user!;
}

export async function getStudentByUserId(
  db: SQLiteDatabase,
  userId: number
): Promise<Student | null> {
  return db.getFirstAsync<Student>(
    'SELECT * FROM students WHERE userId = ?',
    [userId]
  );
}

export async function joinSectionByClassCode(
  db: SQLiteDatabase,
  studentId: number,
  classCode: string
): Promise<{ section: Section; status: 'pending' | 'active' }> {
  const section = await db.getFirstAsync<Section>(
    `SELECT s.*, ay.name as academicYearName, sub.name as subjectName, sub.code as subjectCode,
      (SELECT name FROM users u WHERE u.id = s.teacherId) as teacherName
     FROM sections s
     JOIN academic_years ay ON s.academicYearId = ay.id
     JOIN subjects sub ON s.subjectId = sub.id
     WHERE s.classCode = ? AND s.status = 'active'`,
    [classCode.trim().toUpperCase()]
  );
  if (!section) {
    throw new Error('Class code not found. Please check and try again.');
  }

  const existing = await db.getFirstAsync<Enrollment>(
    'SELECT * FROM enrollments WHERE studentId = ? AND sectionId = ?',
    [studentId, section.id]
  );
  if (existing) {
    if (existing.status === 'active' || existing.status === 'approved') {
      return { section, status: 'active' };
    }
    return { section, status: existing.status as 'pending' | 'active' };
  }

  const mode = section.enrollmentMode === 'auto' ? 'active' : 'pending';
  await db.runAsync(
    "INSERT INTO enrollments (studentId, sectionId, status, effectiveFrom) VALUES (?, ?, ?, date('now'))",
    [studentId, section.id, mode]
  );
  return { section, status: mode };
}

export async function getStudentEnrollments(
  db: SQLiteDatabase,
  studentId: number
): Promise<(Enrollment & { sectionName: string; subjectName: string; subjectCode: string })[]> {
  return db.getAllAsync<Enrollment & { sectionName: string; subjectName: string; subjectCode: string }>(
    `SELECT e.*, s.name as sectionName, sub.name as subjectName, sub.code as subjectCode
     FROM enrollments e
     JOIN sections s ON e.sectionId = s.id
     JOIN subjects sub ON s.subjectId = sub.id
     WHERE e.studentId = ?
     ORDER BY e.id DESC`,
    [studentId]
  );
}

export async function createRecord(
  db: SQLiteDatabase,
  data: {
    studentId: number;
    sectionId: number;
    category: RecordCategory;
    recordType?: string;
    title: string;
    date: string;
    score?: number | null;
    totalScore?: number | null;
    percentage?: number | null;
    status?: string;
    remarks?: string;
    attendanceStatus?: string | null;
    timeIn?: string | null;
    timeOut?: string | null;
    dueDate?: string | null;
    createdBy: number;
  }
): Promise<StudentRecord> {
  const pct =
    data.score != null && data.totalScore != null && data.totalScore > 0
      ? (data.score / data.totalScore) * 100
      : data.percentage ?? null;
  const result = await db.runAsync(
    `INSERT INTO records (studentId, sectionId, category, recordType, title, date, score, totalScore, percentage, status, remarks, attendanceStatus, timeIn, timeOut, dueDate, createdBy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.studentId,
      data.sectionId,
      data.category,
      data.recordType ?? '',
      data.title,
      data.date,
      data.score ?? null,
      data.totalScore ?? null,
      pct,
      data.status ?? 'draft',
      data.remarks ?? '',
      data.attendanceStatus ?? null,
      data.timeIn ?? null,
      data.timeOut ?? null,
      data.dueDate ?? null,
      data.createdBy,
    ]
  );
  return (await db.getFirstAsync<StudentRecord>(
    'SELECT * FROM records WHERE id = ?',
    [result.lastInsertRowId]
  ))!;
}

export async function createBulkRecords(
  db: SQLiteDatabase,
  records: Array<{
    studentId: number;
    sectionId: number;
    category: RecordCategory;
    recordType?: string;
    title: string;
    date: string;
    score?: number | null;
    totalScore?: number | null;
    status?: string;
    remarks?: string;
    attendanceStatus?: string | null;
    timeIn?: string | null;
    timeOut?: string | null;
    dueDate?: string | null;
    createdBy: number;
  }>
): Promise<void> {
  for (const data of records) {
    const pct =
      data.score != null && data.totalScore != null && data.totalScore > 0
        ? (data.score / data.totalScore) * 100
        : null;
    await db.runAsync(
      `INSERT INTO records (studentId, sectionId, category, recordType, title, date, score, totalScore, percentage, status, remarks, attendanceStatus, timeIn, timeOut, dueDate, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.studentId,
        data.sectionId,
        data.category,
        data.recordType ?? '',
        data.title,
        data.date,
        data.score ?? null,
        data.totalScore ?? null,
        pct,
        data.status ?? 'draft',
        data.remarks ?? '',
        data.attendanceStatus ?? null,
        data.timeIn ?? null,
        data.timeOut ?? null,
        data.dueDate ?? null,
        data.createdBy,
      ]
    );
  }
}

export async function getRecordsBySection(
  db: SQLiteDatabase,
  sectionId: number,
  category?: RecordCategory
): Promise<StudentRecord[]> {
  if (category) {
    return db.getAllAsync<StudentRecord>(
      `SELECT r.*, st.firstName || ' ' || st.lastName as studentName
       FROM records r
       JOIN students st ON r.studentId = st.id
       WHERE r.sectionId = ? AND r.category = ?
       ORDER BY r.date DESC, st.lastName`,
      [sectionId, category]
    );
  }
  return db.getAllAsync<StudentRecord>(
    `SELECT r.*, st.firstName || ' ' || st.lastName as studentName
     FROM records r
     JOIN students st ON r.studentId = st.id
     WHERE r.sectionId = ?
     ORDER BY r.date DESC, st.lastName`,
    [sectionId]
  );
}

export async function getRecordsByStudentAndSection(
  db: SQLiteDatabase,
  studentId: number,
  sectionId: number
): Promise<StudentRecord[]> {
  return db.getAllAsync<StudentRecord>(
    'SELECT * FROM records WHERE studentId = ? AND sectionId = ? ORDER BY date DESC',
    [studentId, sectionId]
  );
}

export async function getRecordById(
  db: SQLiteDatabase,
  recordId: number
): Promise<StudentRecord | null> {
  return db.getFirstAsync<StudentRecord>(
    `SELECT r.*, st.firstName || ' ' || st.lastName as studentName
     FROM records r
     JOIN students st ON r.studentId = st.id
     WHERE r.id = ?`,
    [recordId]
  );
}

export async function updateRecord(
  db: SQLiteDatabase,
  id: number,
  data: Partial<{
    title: string;
    score: number | null;
    totalScore: number | null;
    percentage: number | null;
    status: string;
    remarks: string;
    attendanceStatus: string | null;
    timeIn: string | null;
    timeOut: string | null;
    dueDate: string | null;
    recordType: string;
  }>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (fields.length === 0) return;
  fields.push("updatedAt = datetime('now')");
  values.push(id);
  await db.runAsync(`UPDATE records SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function signRecord(
  db: SQLiteDatabase,
  recordId: number,
  userId: number,
  signatureData: string
): Promise<void> {
  await db.runAsync(
    "UPDATE records SET status = 'signed', signedBy = ?, signedAt = datetime('now'), signatureData = ? WHERE id = ?",
    [userId, signatureData, recordId]
  );
}

export async function signBulkRecords(
  db: SQLiteDatabase,
  recordIds: number[],
  userId: number,
  signatureData: string
): Promise<void> {
  for (const id of recordIds) {
    await signRecord(db, id, userId, signatureData);
  }
}

export async function getUnsignedRecords(
  db: SQLiteDatabase,
  teacherId: number
): Promise<(StudentRecord & { studentName: string; sectionName: string })[]> {
  return db.getAllAsync(
    `SELECT r.*, st.firstName || ' ' || st.lastName as studentName, s.name as sectionName
     FROM records r
     JOIN students st ON r.studentId = st.id
     JOIN sections s ON r.sectionId = s.id
     WHERE r.createdBy = ? AND r.status = 'ready_to_sign'
     ORDER BY r.date DESC`,
    [teacherId]
  );
}

export async function getRecordCountByCategory(
  db: SQLiteDatabase,
  studentId: number,
  sectionId: number
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ category: string; count: number }>(
    `SELECT category, COUNT(*) as count FROM records
     WHERE studentId = ? AND sectionId = ? AND status IN ('signed', 'locked')
     GROUP BY category`,
    [studentId, sectionId]
  );
  const counts: Record<string, number> = {
    ATTENDANCE: 0,
    LABORATORY: 0,
    QUIZ: 0,
    EXAM: 0,
    ASSIGNMENT: 0,
  };
  for (const row of rows) {
    counts[row.category] = row.count;
  }
  return counts;
}

export async function getDashboardStats(
  db: SQLiteDatabase,
  teacherId: number,
  academicYearId?: number
) {
  let sectionWhere = `WHERE s.teacherId = ? AND s.status = 'active'`;
  const params: any[] = [teacherId];
  if (academicYearId) {
    sectionWhere += ` AND s.academicYearId = ?`;
    params.push(academicYearId);
  }

  const sections = await db.getAllAsync<Section>(
    `SELECT s.*, ay.name as academicYearName, sub.name as subjectName, sub.code as subjectCode,
      (SELECT COUNT(*) FROM enrollments e WHERE e.sectionId = s.id AND e.status = 'active') as studentCount
     FROM sections s
     JOIN academic_years ay ON s.academicYearId = ay.id
     JOIN subjects sub ON s.subjectId = sub.id
     ${sectionWhere}
     ORDER BY sub.code, s.name`,
    params
  );

  const totalStudents = sections.reduce(
    (sum, s) => sum + (s.studentCount ?? 0),
    0
  );

  const unsignedRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM records r
     JOIN sections s ON r.sectionId = s.id
     WHERE s.teacherId = ? AND r.status = 'ready_to_sign'`,
    [teacherId]
  );

  const recentRecords = await db.getAllAsync<StudentRecord>(
    `SELECT r.*, st.firstName || ' ' || st.lastName as studentName
     FROM records r
     JOIN students st ON r.studentId = st.id
     JOIN sections s ON r.sectionId = s.id
     WHERE s.teacherId = ?
     ORDER BY r.createdAt DESC
     LIMIT 10`,
    [teacherId]
  );

  return {
    sections,
    totalStudents,
    unsignedRecords: unsignedRow?.count ?? 0,
    recentRecords,
  };
}

export async function searchStudents(
  db: SQLiteDatabase,
  query: string,
  sectionId?: number
): Promise<(Student & { sectionNames?: string })[]> {
  const q = `%${query}%`;
  if (sectionId) {
    return db.getAllAsync<Student & { sectionNames: string }>(
      `SELECT st.*,
        GROUP_CONCAT(s.name, ', ') as sectionNames
       FROM students st
       JOIN enrollments e ON st.id = e.studentId
       JOIN sections s ON e.sectionId = s.id
       WHERE e.sectionId = ? AND st.status = 'active'
         AND (st.firstName LIKE ? OR st.lastName LIKE ? OR st.studentNumber LIKE ? OR (st.firstName || ' ' || st.lastName) LIKE ?)
       GROUP BY st.id
       ORDER BY st.lastName, st.firstName`,
      [sectionId, q, q, q, q]
    );
  }
  return db.getAllAsync<Student & { sectionNames: string }>(
    `SELECT st.*,
      GROUP_CONCAT(DISTINCT s.name, ', ') as sectionNames
     FROM students st
     LEFT JOIN enrollments e ON st.id = e.studentId AND e.status = 'active'
     LEFT JOIN sections s ON e.sectionId = s.id
     WHERE st.status = 'active'
       AND (st.firstName LIKE ? OR st.lastName LIKE ? OR st.studentNumber LIKE ? OR (st.firstName || ' ' || st.lastName) LIKE ?)
     GROUP BY st.id
     ORDER BY st.lastName, st.firstName`,
    [q, q, q, q]
  );
}

export async function getStudentTimeline(
  db: SQLiteDatabase,
  studentId: number,
  filters?: { category?: RecordCategory; startDate?: string; endDate?: string }
): Promise<StudentRecord[]> {
  let where = 'WHERE r.studentId = ?';
  const params: any[] = [studentId];
  if (filters?.category) {
    where += ' AND r.category = ?';
    params.push(filters.category);
  }
  if (filters?.startDate) {
    where += ' AND r.date >= ?';
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    where += ' AND r.date <= ?';
    params.push(filters.endDate);
  }
  return db.getAllAsync<StudentRecord>(
    `SELECT r.*, s.name as sectionName, sub.name as subjectName, sub.code as subjectCode
     FROM records r
     JOIN sections s ON r.sectionId = s.id
     JOIN subjects sub ON s.subjectId = sub.id
     ${where}
     ORDER BY r.date DESC, r.createdAt DESC`,
    params
  );
}

export async function getStudentSummary(
  db: SQLiteDatabase,
  studentId: number,
  sectionId?: number
) {
  let where = 'WHERE r.studentId = ?';
  const params: any[] = [studentId];
  if (sectionId) {
    where += ' AND r.sectionId = ?';
    params.push(sectionId);
  }
  const rows = await db.getAllAsync<{ category: string; count: number; avgScore: number | null; signedCount: number }>(
    `SELECT category, COUNT(*) as count, AVG(percentage) as avgScore,
      SUM(CASE WHEN status IN ('signed', 'locked') THEN 1 ELSE 0 END) as signedCount
     FROM records r ${where}
     GROUP BY category`,
    params
  );
  const totalRow = await db.getFirstAsync<{ count: number; signedCount: number }>(
    `SELECT COUNT(*) as count,
      SUM(CASE WHEN status IN ('signed', 'locked') THEN 1 ELSE 0 END) as signedCount
     FROM records r ${where}`,
    params
  );
  return { byCategory: rows, total: totalRow };
}

export async function getSectionSummary(
  db: SQLiteDatabase,
  sectionId: number
) {
  const studentCount = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM enrollments WHERE sectionId = ? AND status = 'active'`,
    [sectionId]
  );
  const recordStats = await db.getAllAsync<{ category: string; count: number; avgScore: number | null; signedCount: number }>(
    `SELECT category, COUNT(*) as count, AVG(percentage) as avgScore,
      SUM(CASE WHEN status IN ('signed', 'locked') THEN 1 ELSE 0 END) as signedCount
     FROM records WHERE sectionId = ?
     GROUP BY category`,
    [sectionId]
  );
  const totalRecords = await db.getFirstAsync<{ count: number; signedCount: number }>(
    `SELECT COUNT(*) as count,
      SUM(CASE WHEN status IN ('signed', 'locked') THEN 1 ELSE 0 END) as signedCount
     FROM records WHERE sectionId = ?`,
    [sectionId]
  );
  return {
    studentCount: studentCount?.count ?? 0,
    byCategory: recordStats,
    total: totalRecords,
  };
}

export async function getAttendanceSummary(
  db: SQLiteDatabase,
  sectionId: number,
  startDate?: string,
  endDate?: string
) {
  let where = "WHERE r.sectionId = ? AND r.category = 'ATTENDANCE'";
  const params: any[] = [sectionId];
  if (startDate) {
    where += ' AND r.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    where += ' AND r.date <= ?';
    params.push(endDate);
  }
  const rows = await db.getAllAsync<{ attendanceStatus: string; count: number }>(
    `SELECT r.attendanceStatus, COUNT(*) as count
     FROM records r ${where}
     GROUP BY r.attendanceStatus`,
    params
  );
  const byStudent = await db.getAllAsync<{ studentId: number; studentName: string; present: number; absent: number; late: number; excused: number }>(
    `SELECT r.studentId, st.firstName || ' ' || st.lastName as studentName,
      SUM(CASE WHEN r.attendanceStatus = 'Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN r.attendanceStatus = 'Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN r.attendanceStatus = 'Late' THEN 1 ELSE 0 END) as late,
      SUM(CASE WHEN r.attendanceStatus = 'Excused' THEN 1 ELSE 0 END) as excused
     FROM records r
     JOIN students st ON r.studentId = st.id
     ${where}
     GROUP BY r.studentId
     ORDER BY st.lastName, st.firstName`,
    params
  );
  return { overall: rows, byStudent };
}

export async function getQuizSummary(
  db: SQLiteDatabase,
  sectionId: number
) {
  const byStudent = await db.getAllAsync<{ studentId: number; studentName: string; count: number; avgScore: number | null; avgPercentage: number | null }>(
    `SELECT r.studentId, st.firstName || ' ' || st.lastName as studentName,
      COUNT(*) as count, AVG(r.score) as avgScore, AVG(r.percentage) as avgPercentage
     FROM records r
     JOIN students st ON r.studentId = st.id
     WHERE r.sectionId = ? AND r.category = 'QUIZ'
     GROUP BY r.studentId
     ORDER BY st.lastName, st.firstName`,
    [sectionId]
  );
  return { byStudent };
}

export async function getLabSummary(
  db: SQLiteDatabase,
  sectionId: number
) {
  const byStudent = await db.getAllAsync<{ studentId: number; studentName: string; count: number; avgScore: number | null; avgPercentage: number | null }>(
    `SELECT r.studentId, st.firstName || ' ' || st.lastName as studentName,
      COUNT(*) as count, AVG(r.score) as avgScore, AVG(r.percentage) as avgPercentage
     FROM records r
     JOIN students st ON r.studentId = st.id
     WHERE r.sectionId = ? AND r.category = 'LABORATORY'
     GROUP BY r.studentId
     ORDER BY st.lastName, st.firstName`,
    [sectionId]
  );
  return { byStudent };
}

export async function getExamSummary(
  db: SQLiteDatabase,
  sectionId: number
) {
  const byStudent = await db.getAllAsync<{ studentId: number; studentName: string; count: number; avgScore: number | null; avgPercentage: number | null }>(
    `SELECT r.studentId, st.firstName || ' ' || st.lastName as studentName,
      COUNT(*) as count, AVG(r.score) as avgScore, AVG(r.percentage) as avgPercentage
     FROM records r
     JOIN students st ON r.studentId = st.id
     WHERE r.sectionId = ? AND r.category = 'EXAM'
     GROUP BY r.studentId
     ORDER BY st.lastName, st.firstName`,
    [sectionId]
  );
  return { byStudent };
}

export async function getAssignmentSummary(
  db: SQLiteDatabase,
  sectionId: number
) {
  const byStudent = await db.getAllAsync<{ studentId: number; studentName: string; submitted: number; late: number; missing: number; excused: number; avgScore: number | null }>(
    `SELECT r.studentId, st.firstName || ' ' || st.lastName as studentName,
      SUM(CASE WHEN r.attendanceStatus = 'Submitted' THEN 1 ELSE 0 END) as submitted,
      SUM(CASE WHEN r.attendanceStatus = 'Late' THEN 1 ELSE 0 END) as late,
      SUM(CASE WHEN r.attendanceStatus = 'Missing' THEN 1 ELSE 0 END) as missing,
      SUM(CASE WHEN r.attendanceStatus = 'Excused' THEN 1 ELSE 0 END) as excused,
      AVG(r.percentage) as avgScore
     FROM records r
     JOIN students st ON r.studentId = st.id
     WHERE r.sectionId = ? AND r.category = 'ASSIGNMENT'
     GROUP BY r.studentId
     ORDER BY st.lastName, st.firstName`,
    [sectionId]
  );
  return { byStudent };
}

export async function createAuditLog(
  db: SQLiteDatabase,
  recordId: number | null,
  actorId: number,
  action: string,
  oldValue: string | null,
  newValue: string | null,
  reason: string
): Promise<void> {
  await db.runAsync(
    'INSERT INTO audit_logs (recordId, actorId, action, oldValue, newValue, reason) VALUES (?, ?, ?, ?, ?, ?)',
    [recordId, actorId, action, oldValue, newValue, reason]
  );
}

export async function getAuditLogs(
  db: SQLiteDatabase,
  recordId: number
): Promise<AuditLog[]> {
  return db.getAllAsync<AuditLog>(
    'SELECT * FROM audit_logs WHERE recordId = ? ORDER BY timestamp DESC',
    [recordId]
  );
}
