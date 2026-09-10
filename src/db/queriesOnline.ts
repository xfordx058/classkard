import { SupabaseClient } from '@supabase/supabase-js';
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

type Db = SupabaseClient;

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function mapUser(row: Record<string, any> | null | undefined): User | null {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name ?? '',
    email: row.email ?? '',
    role: (row.role as User['role']) ?? 'teacher',
    pin: '',
    signatureData: row.signature_data ?? null,
    status: row.status === 'inactive' ? 'inactive' : 'active',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapSection(row: Record<string, any>): Section {
  return {
    id: Number(row.id),
    academicYearId: Number(row.academic_year_id),
    subjectId: Number(row.subject_id),
    teacherId: Number(row.teacher_id),
    name: row.name ?? '',
    classCode: row.class_code ?? '',
    enrollmentMode: row.enrollment_mode === 'auto' ? 'auto' : 'approval',
    status: row.status === 'inactive' ? 'inactive' : 'active',
    academicYearName:
      row.academic_years?.name ?? row.academicYearName ?? row.academic_year_name,
    subjectName:
      row.subjects?.name ?? row.subjectName ?? row.subject_name,
    subjectCode:
      row.subjects?.code ?? row.subjectCode ?? row.subject_code,
    studentCount:
      row.studentCount != null
        ? Number(row.studentCount)
        : row.enrollments
          ? (Array.isArray(row.enrollments)
              ? row.enrollments.filter((e: any) => e.status === 'active').length
              : undefined)
          : undefined,
  };
}

export async function createUser(
  db: Db,
  name: string,
  email: string,
  pin: string,
  role: 'teacher' | 'student' = 'teacher'
): Promise<User> {
  const { data: authData, error: authError } = await db.auth.signUp({
    email,
    password: pin,
    options: { data: { name, role } },
  });
  if (authError) throw authError;
  const authId = authData.user?.id;
  if (!authId) throw new Error('Sign up failed; no user created.');

  const { data, error } = await db
    .from('users')
    .insert({ auth_id: authId, name: name.trim(), email, role })
    .select()
    .single();
  if (error) throw error;
  return mapUser(data)!;
}

export async function loginByPin(
  db: Db,
  email: string,
  pin: string
): Promise<User | null> {
  const { data: signInData, error } = await db.auth.signInWithPassword({
    email,
    password: pin,
  });
  if (error) return null;
  const authId = signInData.user?.id;
  if (!authId) return null;

  const { data, error: fetchError } = await db
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();
  if (fetchError) return null;
  return mapUser(data);
}

export async function getUserById(db: Db, id: number): Promise<User | null> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return mapUser(data);
}

export async function updateUser(
  db: Db,
  id: number,
  data: Partial<Pick<User, 'name' | 'email' | 'pin' | 'signatureData'>>
): Promise<void> {
  const patch: Record<string, any> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.email !== undefined) patch.email = data.email;
  if (data.signatureData !== undefined) patch.signature_data = data.signatureData;

  if (Object.keys(patch).length > 0) {
    const row = await db.from('users').select('auth_id').eq('id', id).maybeSingle();
    if (row.data?.auth_id) {
      await db.from('users').update(patch).eq('id', id);
    }
  }
  if (data.pin !== undefined) {
    await db.auth.updateUser({ password: data.pin });
  }
}

export async function getAcademicYears(db: Db): Promise<AcademicYear[]> {
  const { data, error } = await db
    .from('academic_years')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: Number(r.id),
    name: r.name,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status === 'inactive' ? 'inactive' : 'active',
  }));
}

export async function getActiveAcademicYear(
  db: Db
): Promise<AcademicYear | null> {
  const { data, error } = await db
    .from('academic_years')
    .select('*')
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return {
    id: Number(data.id),
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status === 'inactive' ? 'inactive' : 'active',
  };
}

export async function createAcademicYear(
  db: Db,
  name: string,
  startDate: string,
  endDate: string
): Promise<AcademicYear> {
  const { data, error } = await db
    .from('academic_years')
    .insert({ name, start_date: startDate, end_date: endDate, status: 'active' })
    .select()
    .single();
  if (error) throw error;
  return {
    id: Number(data.id),
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    status: 'active',
  };
}

export async function updateAcademicYearStatus(
  db: Db,
  id: number,
  status: 'active' | 'inactive'
): Promise<void> {
  await db.from('academic_years').update({ status }).eq('id', id);
}

export async function deleteAcademicYear(db: Db, id: number): Promise<void> {
  await db.from('academic_years').delete().eq('id', id);
}

export async function getSubjects(db: Db): Promise<Subject[]> {
  const { data, error } = await db
    .from('subjects')
    .select('*')
    .order('code');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: Number(r.id),
    code: r.code,
    name: r.name,
    description: r.description ?? '',
  }));
}

export async function getSubjectById(
  db: Db,
  id: number
): Promise<Subject | null> {
  const { data, error } = await db
    .from('subjects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return data
    ? {
        id: Number(data.id),
        code: data.code,
        name: data.name,
        description: data.description ?? '',
      }
    : null;
}

export async function createSubject(
  db: Db,
  code: string,
  name: string,
  description: string
): Promise<Subject> {
  const { data, error } = await db
    .from('subjects')
    .insert({ code, name, description })
    .select()
    .single();
  if (error) throw error;
  return { id: Number(data.id), code: data.code, name: data.name, description: data.description ?? '' };
}

export async function updateSubject(
  db: Db,
  id: number,
  code: string,
  name: string,
  description: string
): Promise<void> {
  await db.from('subjects').update({ code, name, description }).eq('id', id);
}

export async function deleteSubject(db: Db, id: number): Promise<void> {
  await db.from('subjects').delete().eq('id', id);
}

export async function getSectionsByTeacher(
  db: Db,
  teacherId: number,
  academicYearId?: number
): Promise<Section[]> {
  let q = db
    .from('sections')
    .select('*, academic_years(name), subjects(code, name), users(name)')
    .eq('teacher_id', teacherId)
    .eq('status', 'active');
  if (academicYearId) {
    q = q.eq('academic_year_id', academicYearId);
  }
  const { data, error } = await q.order('created_at', { ascending: true });
  if (error) throw error;

  const sectionIds = (data ?? []).map((r: any) => r.id);
  const counts: Record<number, number> = {};
  if (sectionIds.length > 0) {
    const { data: enr } = await db
      .from('enrollments')
      .select('section_id')
      .eq('status', 'active')
      .in('section_id', sectionIds);
    for (const e of enr ?? []) {
      counts[Number(e.section_id)] = (counts[Number(e.section_id)] ?? 0) + 1;
    }
  }

  const sorted = academicYearId
    ? (data ?? []).slice()
    : (data ?? []).sort((a: any, b: any) => {
        const ayA = String(a.academic_years?.name ?? '');
        const ayB = String(b.academic_years?.name ?? '');
        if (ayA !== ayB) return ayA > ayB ? -1 : 1;
        return 0;
      });

  return (sorted ?? []).map((r: any) => ({
    id: Number(r.id),
    academicYearId: Number(r.academic_year_id),
    subjectId: Number(r.subject_id),
    teacherId: Number(r.teacher_id),
    name: r.name ?? '',
    classCode: r.class_code ?? '',
    enrollmentMode: r.enrollment_mode === 'auto' ? 'auto' : 'approval',
    status: r.status === 'inactive' ? 'inactive' : 'active',
    academicYearName: r.academic_years?.name,
    subjectName: r.subjects?.name as string | undefined,
    subjectCode: r.subjects?.code as string | undefined,
    studentCount: counts[Number(r.id)] ?? 0,
  }));
}

export async function getSectionById(
  db: Db,
  sectionId: number
): Promise<Section | null> {
  const { data, error } = await db
    .from('sections')
    .select('*, academic_years(name), subjects(code, name), users(name)')
    .eq('id', sectionId)
    .maybeSingle();
  if (error || !data) return null;

  const { data: enr } = await db
    .from('enrollments')
    .select('section_id')
    .eq('section_id', sectionId)
    .eq('status', 'active');

  return {
    id: Number(data.id),
    academicYearId: Number(data.academic_year_id),
    subjectId: Number(data.subject_id),
    teacherId: Number(data.teacher_id),
    name: data.name ?? '',
    classCode: data.class_code ?? '',
    enrollmentMode: data.enrollment_mode === 'auto' ? 'auto' : 'approval',
    status: data.status === 'inactive' ? 'inactive' : 'active',
    academicYearName: data.academic_years?.name,
    subjectName: data.subjects?.name as string | undefined,
    subjectCode: data.subjects?.code as string | undefined,
    studentCount: (enr ?? []).length,
  };
}

export async function createSection(
  db: Db,
  academicYearId: number,
  subjectId: number,
  teacherId: number,
  name: string
): Promise<Section> {
  let classCode = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await db
      .from('sections')
      .select('id')
      .eq('class_code', classCode)
      .maybeSingle();
    if (!existing) break;
    classCode = generateCode();
    attempts++;
  }
  const { data, error } = await db
    .from('sections')
    .insert({
      academic_year_id: academicYearId,
      subject_id: subjectId,
      teacher_id: teacherId,
      name,
      class_code: classCode,
    })
    .select()
    .single();
  if (error) throw error;
  return (await getSectionById(db, Number(data.id)))!;
}

export async function getStudentsBySection(
  db: Db,
  sectionId: number
): Promise<Student[]> {
  const { data, error } = await db
    .from('students')
    .select('*, enrollments!inner(section_id)')
    .eq('enrollments.section_id', sectionId)
    .eq('enrollments.status', 'active')
    .eq('status', 'active')
    .order('last_name');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: Number(r.id),
    userId: r.user_id != null ? Number(r.user_id) : null,
    studentNumber: r.student_number ?? '',
    firstName: r.first_name ?? '',
    middleName: r.middle_name ?? '',
    lastName: r.last_name ?? '',
    status: r.status === 'archived' ? 'archived' : 'active',
  }));
}

export async function getStudentById(
  db: Db,
  studentId: number
): Promise<Student | null> {
  const { data, error } = await db
    .from('students')
    .select('*')
    .eq('id', studentId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: Number(data.id),
    userId: data.user_id != null ? Number(data.user_id) : null,
    studentNumber: data.student_number ?? '',
    firstName: data.first_name ?? '',
    middleName: data.middle_name ?? '',
    lastName: data.last_name ?? '',
    status: data.status === 'archived' ? 'archived' : 'active',
  };
}

export async function createStudent(
  db: Db,
  studentNumber: string,
  firstName: string,
  middleName: string,
  lastName: string
): Promise<Student> {
  const { data: existing } = await db
    .from('students')
    .select('*')
    .eq('student_number', studentNumber)
    .maybeSingle();
  if (existing) {
    return {
      id: Number(existing.id),
      userId: existing.user_id != null ? Number(existing.user_id) : null,
      studentNumber: existing.student_number,
      firstName: existing.first_name,
      middleName: existing.middle_name ?? '',
      lastName: existing.last_name,
      status: existing.status === 'archived' ? 'archived' : 'active',
    };
  }
  const { data, error } = await db
    .from('students')
    .insert({ student_number: studentNumber, first_name: firstName, middle_name: middleName, last_name: lastName })
    .select()
    .single();
  if (error) throw error;
  return {
    id: Number(data.id),
    userId: data.user_id != null ? Number(data.user_id) : null,
    studentNumber: data.student_number,
    firstName: data.first_name,
    middleName: data.middle_name ?? '',
    lastName: data.last_name,
    status: data.status === 'archived' ? 'archived' : 'active',
  };
}

export async function enrollStudent(
  db: Db,
  studentId: number,
  sectionId: number,
  status: 'pending' | 'active' = 'active'
): Promise<Enrollment> {
  const { data: existing } = await db
    .from('enrollments')
    .select('*')
    .eq('student_id', studentId)
    .eq('section_id', sectionId)
    .maybeSingle();
  if (existing) {
    return {
      id: Number(existing.id),
      studentId: Number(existing.student_id),
      sectionId: Number(existing.section_id),
      effectiveFrom: existing.effective_from ?? '',
      effectiveTo: existing.effective_to,
      status: existing.status as Enrollment['status'],
    };
  }
  const { data, error } = await db
    .from('enrollments')
    .insert({ student_id: studentId, section_id: sectionId, status })
    .select()
    .single();
  if (error) throw error;
  return {
    id: Number(data.id),
    studentId: Number(data.student_id),
    sectionId: Number(data.section_id),
    effectiveFrom: data.effective_from ?? '',
    effectiveTo: data.effective_to,
    status: data.status as Enrollment['status'],
  };
}

export async function getEnrollmentRequests(
  db: Db,
  sectionId: number
): Promise<Enrollment[]> {
  const { data, error } = await db
    .from('enrollments')
    .select('*, students(first_name, last_name, student_number)')
    .eq('section_id', sectionId)
    .eq('status', 'pending')
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: Number(r.id),
    studentId: Number(r.student_id),
    sectionId: Number(r.section_id),
    effectiveFrom: r.effective_from ?? '',
    effectiveTo: r.effective_to,
    status: r.status as Enrollment['status'],
    studentName: r.students
      ? `${r.students.first_name} ${r.students.last_name}`
      : undefined,
    studentNumber: r.students?.student_number,
  }));
}

export async function approveEnrollment(
  db: Db,
  enrollmentId: number
): Promise<void> {
  await db
    .from('enrollments')
    .update({ status: 'active', effective_from: new Date().toISOString().slice(0, 10) })
    .eq('id', enrollmentId);
}

export async function rejectEnrollment(
  db: Db,
  enrollmentId: number
): Promise<void> {
  await db.from('enrollments').delete().eq('id', enrollmentId);
}

export async function approveAllEnrollments(
  db: Db,
  sectionId: number
): Promise<void> {
  const { data } = await db
    .from('enrollments')
    .select('id')
    .eq('section_id', sectionId)
    .eq('status', 'pending');
  const ids = (data ?? []).map((r) => r.id);
  if (ids.length === 0) return;
  await db
    .from('enrollments')
    .update({ status: 'active', effective_from: new Date().toISOString().slice(0, 10) })
    .in('id', ids);
}

export async function getStudentSections(
  db: Db,
  studentId: number
): Promise<Section[]> {
  const { data, error } = await db
    .from('enrollments')
    .select('sections(*, academic_years(name), subjects(code, name))')
    .eq('student_id', studentId)
    .eq('status', 'active');
  if (error) throw error;
  const sections = (data ?? [])
    .map((r: any) => r.sections)
    .filter(Boolean);
  return sections.map((s: any) => ({
    id: Number(s.id),
    academicYearId: Number(s.academic_year_id),
    subjectId: Number(s.subject_id),
    teacherId: Number(s.teacher_id),
    name: s.name ?? '',
    classCode: s.class_code ?? '',
    enrollmentMode: s.enrollment_mode === 'auto' ? 'auto' : 'approval',
    status: s.status === 'inactive' ? 'inactive' : 'active',
    academicYearName: s.academic_years?.name,
    subjectName: s.subjects?.name,
    subjectCode: s.subjects?.code,
  }));
}

export async function registerStudent(
  db: Db,
  name: string,
  studentNumber: string,
  email: string,
  pin: string
): Promise<User> {
  const names = name.trim().split(/\s+/);
  const firstName = names[0] ?? name.trim();
  const lastName = names.length > 1 ? names[names.length - 1] : name.trim();
  const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : '';

  const { data: existingStudent } = await db
    .from('students')
    .select('id')
    .eq('student_number', studentNumber)
    .maybeSingle();
  if (existingStudent) {
    throw new Error('A student with this student number already exists.');
  }

  const { data: authData, error: authError } = await db.auth.signUp({
    email,
    password: pin,
    options: { data: { name: name.trim(), role: 'student' } },
  });
  if (authError) throw authError;
  const authId = authData.user?.id;
  if (!authId) throw new Error('Registration failed; no user created.');

  const { data: user, error: userError } = await db
    .from('users')
    .insert({ auth_id: authId, name: name.trim(), email, role: 'student' })
    .select()
    .single();
  if (userError) throw userError;

  const { error: studentError } = await db.from('students').insert({
    user_id: user.id,
    student_number: studentNumber,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    status: 'active',
  });
  if (studentError) throw studentError;

  return mapUser(user)!;
}

export async function getStudentByUserId(
  db: Db,
  userId: number
): Promise<Student | null> {
  const { data, error } = await db
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: Number(data.id),
    userId: data.user_id != null ? Number(data.user_id) : null,
    studentNumber: data.student_number ?? '',
    firstName: data.first_name ?? '',
    middleName: data.middle_name ?? '',
    lastName: data.last_name ?? '',
    status: data.status === 'archived' ? 'archived' : 'active',
  };
}

export async function joinSectionByClassCode(
  db: Db,
  studentId: number,
  classCode: string
): Promise<{ section: Section; status: 'pending' | 'active' }> {
  const { data: section, error } = await db
    .from('sections')
    .select('*, academic_years(name), subjects(code, name), users(name)')
    .eq('class_code', classCode.trim().toUpperCase())
    .eq('status', 'active')
    .maybeSingle();
  if (error || !section) {
    throw new Error('Class code not found. Please check and try again.');
  }

  const { data: existing } = await db
    .from('enrollments')
    .select('*')
    .eq('student_id', studentId)
    .eq('section_id', section.id)
    .maybeSingle();
  if (existing) {
    const status =
      existing.status === 'active' || existing.status === 'approved'
        ? 'active'
        : (existing.status as 'pending' | 'active');
    return { section: mapSection(section), status };
  }

  const mode = section.enrollment_mode === 'auto' ? 'active' : 'pending';
  await db.from('enrollments').insert({
    student_id: studentId,
    section_id: section.id,
    status: mode,
    effective_from: new Date().toISOString().slice(0, 10),
  });
  return { section: mapSection(section), status: mode };
}

export async function getStudentEnrollments(
  db: Db,
  studentId: number
): Promise<(Enrollment & { sectionName: string; subjectName: string; subjectCode: string })[]> {
  const { data, error } = await db
    .from('enrollments')
    .select('*, sections(name, subjects(code, name))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: Number(r.id),
    studentId: Number(r.student_id),
    sectionId: Number(r.section_id),
    effectiveFrom: r.effective_from ?? '',
    effectiveTo: r.effective_to,
    status: r.status as Enrollment['status'],
    sectionName: r.sections?.name ?? '',
    subjectName: r.sections?.subjects?.name ?? '',
    subjectCode: r.sections?.subjects?.code ?? '',
  }));
}

async function insertRecord(
  db: Db,
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
) {
  const pct =
    data.score != null && data.totalScore != null && data.totalScore > 0
      ? (data.score / data.totalScore) * 100
      : data.percentage ?? null;
  const { data: inserted, error } = await db
    .from('records')
    .insert({
      student_id: data.studentId,
      section_id: data.sectionId,
      category: data.category,
      record_type: data.recordType ?? '',
      title: data.title,
      date: data.date,
      score: data.score ?? null,
      total_score: data.totalScore ?? null,
      percentage: pct,
      status: data.status ?? 'draft',
      remarks: data.remarks ?? '',
      attendance_status: data.attendanceStatus ?? null,
      time_in: data.timeIn ?? null,
      time_out: data.timeOut ?? null,
      due_date: data.dueDate ?? null,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return inserted;
}

export async function createRecord(
  db: Db,
  data: Parameters<typeof insertRecord>[1]
): Promise<StudentRecord> {
  const row = await insertRecord(db, data);
  return mapRecord(row, db);
}

export async function createBulkRecords(
  db: Db,
  records: Parameters<typeof insertRecord>[1][]
): Promise<void> {
  const rows = records.map((data) => {
    const pct =
      data.score != null && data.totalScore != null && data.totalScore > 0
        ? (data.score / data.totalScore) * 100
        : null;
    return {
      student_id: data.studentId,
      section_id: data.sectionId,
      category: data.category,
      record_type: data.recordType ?? '',
      title: data.title,
      date: data.date,
      score: data.score ?? null,
      total_score: data.totalScore ?? null,
      percentage: pct,
      status: data.status ?? 'draft',
      remarks: data.remarks ?? '',
      attendance_status: data.attendanceStatus ?? null,
      time_in: data.timeIn ?? null,
      time_out: data.timeOut ?? null,
      due_date: data.dueDate ?? null,
      created_by: data.createdBy,
    };
  });
  if (rows.length === 0) return;
  const { error } = await db.from('records').insert(rows);
  if (error) throw error;
}

async function mapRecord(row: Record<string, any>, db: Db): Promise<StudentRecord> {
  let studentName: string | undefined;
  let sectionName: string | undefined;
  if (row.students) {
    studentName = `${row.students.first_name} ${row.students.last_name}`.trim();
  } else if (row.studentName) {
    studentName = row.studentName;
  }
  if (row.sections?.name) sectionName = row.sections.name;

  return {
    id: Number(row.id),
    studentId: Number(row.student_id),
    sectionId: Number(row.section_id),
    category: row.category as RecordCategory,
    recordType: row.record_type ?? '',
    title: row.title ?? '',
    date: row.date ?? '',
    score: row.score != null ? Number(row.score) : null,
    totalScore: row.total_score != null ? Number(row.total_score) : null,
    percentage: row.percentage != null ? Number(row.percentage) : null,
    status: row.status as StudentRecord['status'],
    remarks: row.remarks ?? '',
    attendanceStatus: row.attendance_status,
    timeIn: row.time_in,
    timeOut: row.time_out,
    dueDate: row.due_date,
    createdBy: Number(row.created_by),
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    signedBy: row.signed_by != null ? Number(row.signed_by) : null,
    signedAt: row.signed_at,
    signatureData: row.signature_data,
    lockedAt: row.locked_at,
  } as StudentRecord;
}

export async function getRecordsBySection(
  db: Db,
  sectionId: number,
  category?: RecordCategory
): Promise<StudentRecord[]> {
  let q = db
    .from('records')
    .select('*, students(first_name, last_name)')
    .eq('section_id', sectionId);
  if (category) q = q.eq('category', category);
  const { data, error } = await q.order('date', { ascending: false });
  if (error) throw error;
  return Promise.all((data ?? []).map((r) => mapRecord(r, db)));
}

export async function getRecordsByStudentAndSection(
  db: Db,
  studentId: number,
  sectionId: number
): Promise<StudentRecord[]> {
  const { data, error } = await db
    .from('records')
    .select('*')
    .eq('student_id', studentId)
    .eq('section_id', sectionId)
    .order('date', { ascending: false });
  if (error) throw error;
  return Promise.all((data ?? []).map((r) => mapRecord(r, db)));
}

export async function getRecordById(
  db: Db,
  recordId: number
): Promise<StudentRecord | null> {
  const { data, error } = await db
    .from('records')
    .select('*, students(first_name, last_name)')
    .eq('id', recordId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRecord(data, db);
}

export async function updateRecord(
  db: Db,
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
  const patch: Record<string, any> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.score !== undefined) patch.score = data.score;
  if (data.totalScore !== undefined) patch.total_score = data.totalScore;
  if (data.percentage !== undefined) patch.percentage = data.percentage;
  if (data.status !== undefined) patch.status = data.status;
  if (data.remarks !== undefined) patch.remarks = data.remarks;
  if (data.attendanceStatus !== undefined) patch.attendance_status = data.attendanceStatus;
  if (data.timeIn !== undefined) patch.time_in = data.timeIn;
  if (data.timeOut !== undefined) patch.time_out = data.timeOut;
  if (data.dueDate !== undefined) patch.due_date = data.dueDate;
  if (data.recordType !== undefined) patch.record_type = data.recordType;
  patch.updated_at = new Date().toISOString();
  const { error } = await db.from('records').update(patch).eq('id', id);
  if (error) throw error;
}

export async function signRecord(
  db: Db,
  recordId: number,
  userId: number,
  signatureData: string
): Promise<void> {
  const { error } = await db.from('records').update({
    status: 'signed',
    signed_by: userId,
    signed_at: new Date().toISOString(),
    signature_data: signatureData,
  }).eq('id', recordId);
  if (error) throw error;
}

export async function signBulkRecords(
  db: Db,
  recordIds: number[],
  userId: number,
  signatureData: string
): Promise<void> {
  for (const id of recordIds) {
    await signRecord(db, id, userId, signatureData);
  }
}

export async function getUnsignedRecords(
  db: Db,
  teacherId: number
): Promise<(StudentRecord & { studentName: string; sectionName: string })[]> {
  const { data, error } = await db
    .from('records')
    .select('*, students(first_name, last_name), sections(name)')
    .eq('created_by', teacherId)
    .eq('status', 'ready_to_sign')
    .order('date', { ascending: false });
  if (error) throw error;
  const rows = await Promise.all((data ?? []).map((r) => mapRecord(r, db)));
  return rows.map((r: any, i: number) => {
    const raw = data[i];
    return {
      ...r,
      studentName: raw.students
        ? `${raw.students.first_name} ${raw.students.last_name}`
        : '',
      sectionName: raw.sections?.name ?? '',
    };
  });
}

export async function getRecordCountByCategory(
  db: Db,
  studentId: number,
  sectionId: number
): Promise<Record<string, number>> {
  const { data, error } = await db
    .from('records')
    .select('category')
    .eq('student_id', studentId)
    .eq('section_id', sectionId)
    .in('status', ['signed', 'locked']);
  if (error) throw error;
  const counts: Record<string, number> = {
    ATTENDANCE: 0,
    LABORATORY: 0,
    QUIZ: 0,
    EXAM: 0,
    ASSIGNMENT: 0,
  };
  for (const r of data ?? []) {
    if (counts[r.category] !== undefined) counts[r.category] += 1;
  }
  return counts;
}

export async function getDashboardStats(
  db: Db,
  teacherId: number,
  academicYearId?: number
) {
  const sections = await getSectionsByTeacher(db, teacherId, academicYearId);
  const totalStudents = sections.reduce((sum, s) => sum + (s.studentCount ?? 0), 0);

  const { data: unsignedData, error: unsignedError } = await db
    .from('records')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', teacherId)
    .eq('status', 'ready_to_sign');
  if (unsignedError) throw unsignedError;
  const unsignedRecords = unsignedData?.length ?? 0;

  const { data: recent, error: recentError } = await db
    .from('records')
    .select('*, students(first_name, last_name)')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (recentError) throw recentError;
  const recentRecords = await Promise.all(
    (recent ?? []).map(async (r) => {
      const rec = await mapRecord(r, db);
      return {
        ...rec,
        studentName: r.students
          ? `${r.students.first_name} ${r.students.last_name}`
          : '',
      };
    })
  );

  return { sections, totalStudents, unsignedRecords, recentRecords };
}

export async function searchStudents(
  db: Db,
  query: string,
  sectionId?: number
): Promise<(Student & { sectionNames?: string })[]> {
  const q = `%${query}%`;
  let builder = db
    .from('students')
    .select('*, enrollments(sections(name))')
    .eq('status', 'active')
    .or(`first_name.ilike.${q},last_name.ilike.${q},student_number.ilike.${q}`);
  if (sectionId) {
    builder = builder.eq('enrollments.section_id', sectionId).eq('enrollments.status', 'active');
  }
  const { data, error } = await builder.order('last_name');
  if (error) throw error;

  return (data ?? []).map((r: any) => {
    const names = (r.enrollments ?? [])
      .map((e: any) => e.sections?.name)
      .filter(Boolean) as string[];
    const unique = [...new Set(names)];
    return {
      id: Number(r.id),
      userId: r.user_id != null ? Number(r.user_id) : null,
      studentNumber: r.student_number ?? '',
      firstName: r.first_name ?? '',
      middleName: r.middle_name ?? '',
      lastName: r.last_name ?? '',
      status: r.status === 'archived' ? 'archived' : 'active',
      sectionNames: unique.join(', '),
    };
  });
}

export async function getStudentTimeline(
  db: Db,
  studentId: number,
  filters?: { category?: RecordCategory; startDate?: string; endDate?: string }
): Promise<StudentRecord[]> {
  let q = db
    .from('records')
    .select('*, sections(name, subjects(code, name))')
    .eq('student_id', studentId);
  if (filters?.category) q = q.eq('category', filters.category);
  if (filters?.startDate) q = q.gte('date', filters.startDate);
  if (filters?.endDate) q = q.lte('date', filters.endDate);
  const { data, error } = await q.order('date', { ascending: false });
  if (error) throw error;

  const rows = await Promise.all((data ?? []).map((r) => mapRecord(r, db)));
  return rows.map((r: any, i: number) => {
    const raw = data[i];
    return {
      ...r,
      sectionName: raw.sections?.name ?? '',
      subjectName: raw.sections?.subjects?.name ?? '',
      subjectCode: raw.sections?.subjects?.code ?? '',
    };
  });
}

export async function getStudentSummary(
  db: Db,
  studentId: number,
  sectionId?: number
) {
  let q = db.from('records').select('category, percentage, status, signed_by').eq('student_id', studentId);
  if (sectionId) q = q.eq('section_id', sectionId);
  const { data, error } = await q;
  if (error) throw error;

  const map = new Map<string, { count: number; sum: number | null; signedCount: number }>();
  for (const r of data ?? []) {
    const e = map.get(r.category) ?? { count: 0, sum: null as number | null, signedCount: 0 };
    e.count += 1;
    if (r.percentage != null) e.sum = (e.sum ?? 0) + Number(r.percentage);
    if (r.status === 'signed' || r.status === 'locked') e.signedCount += 1;
    map.set(r.category, e);
  }
  const byCategory = [...map.entries()].map(([category, v]) => ({
    category,
    count: v.count,
    avgScore: v.sum != null ? v.sum / v.count : null,
    signedCount: v.signedCount,
  }));

  const totalCount = data?.length ?? 0;
  const totalSigned = (data ?? []).filter((r) => r.status === 'signed' || r.status === 'locked').length;
  return { byCategory, total: { count: totalCount, signedCount: totalSigned } };
}

export async function getSectionSummary(db: Db, sectionId: number) {
  const { data: enr } = await db
    .from('enrollments')
    .select('id')
    .eq('section_id', sectionId)
    .eq('status', 'active');
  const { data: records, error } = await db
    .from('records')
    .select('category, percentage, status, signed_by')
    .eq('section_id', sectionId);
  if (error) throw error;

  const map = new Map<string, { count: number; sum: number | null; signedCount: number }>();
  for (const r of records ?? []) {
    const e = map.get(r.category) ?? { count: 0, sum: null as number | null, signedCount: 0 };
    e.count += 1;
    if (r.percentage != null) e.sum = (e.sum ?? 0) + Number(r.percentage);
    if (r.status === 'signed' || r.status === 'locked') e.signedCount += 1;
    map.set(r.category, e);
  }
  const byCategory = [...map.entries()].map(([category, v]) => ({
    category,
    count: v.count,
    avgScore: v.sum != null ? v.sum / v.count : null,
    signedCount: v.signedCount,
  }));
  const totalRecords = records?.length ?? 0;
  const totalSigned = (records ?? []).filter((r) => r.status === 'signed' || r.status === 'locked').length;
  return {
    studentCount: (enr ?? []).length,
    byCategory,
    total: { count: totalRecords, signedCount: totalSigned },
  };
}

export async function getAttendanceSummary(
  db: Db,
  sectionId: number,
  startDate?: string,
  endDate?: string
) {
  let q = db
    .from('records')
    .select('attendance_status, student_id, students(first_name, last_name)')
    .eq('section_id', sectionId)
    .eq('category', 'ATTENDANCE');
  if (startDate) q = q.gte('date', startDate);
  if (endDate) q = q.lte('date', endDate);
  const { data, error } = await q;
  if (error) throw error;

  const overall = new Map<string, number>();
  const byStudentMap = new Map<number, { name: string; present: number; absent: number; late: number; excused: number }>();
  for (const r of data ?? []) {
    const st = r.attendance_status ?? 'Unknown';
    overall.set(st, (overall.get(st) ?? 0) + 1);
    const sid = Number(r.student_id);
    const student = Array.isArray(r.students) ? r.students[0] : r.students;
    const name = student ? `${student.first_name} ${student.last_name}` : `Student ${sid}`;
    const e = byStudentMap.get(sid) ?? { name, present: 0, absent: 0, late: 0, excused: 0 };
    if (st === 'Present') e.present += 1;
    else if (st === 'Absent') e.absent += 1;
    else if (st === 'Late') e.late += 1;
    else if (st === 'Excused') e.excused += 1;
    byStudentMap.set(sid, e);
  }
  return {
    overall: [...overall.entries()].map(([attendanceStatus, count]) => ({ attendanceStatus, count })),
    byStudent: [...byStudentMap.values()],
  };
}

async function getCategorySummary(db: Db, sectionId: number, category: RecordCategory) {
  const { data, error } = await db
    .from('records')
    .select('student_id, score, percentage, students(first_name, last_name), attendance_status')
    .eq('section_id', sectionId)
    .eq('category', category);
  if (error) throw error;

  const map = new Map<number, { name: string; count: number; sumScore: number | null; sumPct: number | null; submitted: number; late: number; missing: number; excused: number }>();
  for (const r of data ?? []) {
    const sid = Number(r.student_id);
    const student = Array.isArray(r.students) ? r.students[0] : r.students;
    const name = student ? `${student.first_name} ${student.last_name}` : `Student ${sid}`;
    const e = map.get(sid) ?? { name, count: 0, sumScore: null as number | null, sumPct: null as number | null, submitted: 0, late: 0, missing: 0, excused: 0 };
    e.count += 1;
    if (r.score != null) e.sumScore = (e.sumScore ?? 0) + Number(r.score);
    if (r.percentage != null) e.sumPct = (e.sumPct ?? 0) + Number(r.percentage);
    if (r.attendance_status === 'Submitted') e.submitted += 1;
    else if (r.attendance_status === 'Late') e.late += 1;
    else if (r.attendance_status === 'Missing') e.missing += 1;
    else if (r.attendance_status === 'Excused') e.excused += 1;
    map.set(sid, e);
  }
  return [...map.values()];
}

export async function getQuizSummary(db: Db, sectionId: number) {
  const rows = await getCategorySummary(db, sectionId, 'QUIZ');
  return {
    byStudent: rows.map((r) => ({
      studentId: 0,
      studentName: r.name,
      count: r.count,
      avgScore: r.sumScore != null ? r.sumScore / r.count : null,
      avgPercentage: r.sumPct != null ? r.sumPct / r.count : null,
    })),
  };
}

export async function getLabSummary(db: Db, sectionId: number) {
  const rows = await getCategorySummary(db, sectionId, 'LABORATORY');
  return {
    byStudent: rows.map((r) => ({
      studentId: 0,
      studentName: r.name,
      count: r.count,
      avgScore: r.sumScore != null ? r.sumScore / r.count : null,
      avgPercentage: r.sumPct != null ? r.sumPct / r.count : null,
    })),
  };
}

export async function getExamSummary(db: Db, sectionId: number) {
  const rows = await getCategorySummary(db, sectionId, 'EXAM');
  return {
    byStudent: rows.map((r) => ({
      studentId: 0,
      studentName: r.name,
      count: r.count,
      avgScore: r.sumScore != null ? r.sumScore / r.count : null,
      avgPercentage: r.sumPct != null ? r.sumPct / r.count : null,
    })),
  };
}

export async function getAssignmentSummary(db: Db, sectionId: number) {
  const rows = await getCategorySummary(db, sectionId, 'ASSIGNMENT');
  return {
    byStudent: rows.map((r) => ({
      studentId: 0,
      studentName: r.name,
      submitted: r.submitted,
      late: r.late,
      missing: r.missing,
      excused: r.excused,
      avgScore: r.sumPct != null ? r.sumPct / r.count : null,
    })),
  };
}

export async function createAuditLog(
  db: Db,
  recordId: number | null,
  actorId: number,
  action: string,
  oldValue: string | null,
  newValue: string | null,
  reason: string
): Promise<void> {
  await db.from('audit_logs').insert({
    record_id: recordId,
    actor_id: actorId,
    action,
    old_value: oldValue,
    new_value: newValue,
    reason,
  });
}

export async function getAuditLogs(
  db: Db,
  recordId: number
): Promise<AuditLog[]> {
  const { data, error } = await db
    .from('audit_logs')
    .select('*')
    .eq('record_id', recordId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: Number(r.id),
    recordId: r.record_id != null ? Number(r.record_id) : null,
    actorId: Number(r.actor_id),
    action: r.action,
    oldValue: r.old_value,
    newValue: r.new_value,
    timestamp: r.created_at,
    reason: r.reason,
  }));
}

