import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('classkard.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

async function ensureColumn(
  database: SQLiteDatabase,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const columns = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

export async function initializeDatabase(database: SQLiteDatabase): Promise<void> {
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  const created = currentVersion < 1;

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'teacher',
      pin TEXT NOT NULL,
      signatureData TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS academic_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      academicYearId INTEGER NOT NULL,
      subjectId INTEGER NOT NULL,
      teacherId INTEGER NOT NULL,
      name TEXT NOT NULL,
      classCode TEXT NOT NULL UNIQUE,
      enrollmentMode TEXT NOT NULL DEFAULT 'approval',
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (academicYearId) REFERENCES academic_years(id),
      FOREIGN KEY (subjectId) REFERENCES subjects(id),
      FOREIGN KEY (teacherId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      studentNumber TEXT NOT NULL UNIQUE,
      firstName TEXT NOT NULL,
      middleName TEXT DEFAULT '',
      lastName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      sectionId INTEGER NOT NULL,
      effectiveFrom TEXT NOT NULL DEFAULT (date('now')),
      effectiveTo TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (studentId) REFERENCES students(id),
      FOREIGN KEY (sectionId) REFERENCES sections(id),
      UNIQUE(studentId, sectionId)
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId INTEGER NOT NULL,
      sectionId INTEGER NOT NULL,
      category TEXT NOT NULL,
      recordType TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT (date('now')),
      score REAL,
      totalScore REAL,
      percentage REAL,
      status TEXT NOT NULL DEFAULT 'draft',
      remarks TEXT DEFAULT '',
      attendanceStatus TEXT,
      timeIn TEXT,
      timeOut TEXT,
      dueDate TEXT,
      createdBy INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      signedBy INTEGER,
      signedAt TEXT,
      signatureData TEXT,
      lockedAt TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id),
      FOREIGN KEY (sectionId) REFERENCES sections(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId INTEGER,
      actorId INTEGER NOT NULL,
      action TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      reason TEXT DEFAULT '',
      FOREIGN KEY (recordId) REFERENCES records(id),
      FOREIGN KEY (actorId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_records_student ON records(studentId);
    CREATE INDEX IF NOT EXISTS idx_records_section ON records(sectionId);
    CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
    CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
    CREATE INDEX IF NOT EXISTS idx_enrollments_section ON enrollments(sectionId);
    CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(studentId);
  `);

  await database.execAsync('PRAGMA user_version = 1');

  if (!created) {
    await migrateSchema(database);
  }
}

async function migrateSchema(database: SQLiteDatabase): Promise<void> {
  await ensureColumn(database, 'sections', 'enrollmentMode', "TEXT NOT NULL DEFAULT 'approval'");
  await ensureColumn(database, 'sections', 'status', "TEXT NOT NULL DEFAULT 'active'");
  await ensureColumn(database, 'students', 'userId', 'INTEGER REFERENCES users(id)');
  await ensureColumn(database, 'students', 'middleName', "TEXT DEFAULT ''");
  await ensureColumn(database, 'students', 'status', "TEXT NOT NULL DEFAULT 'active'");
  await ensureColumn(database, 'enrollments', 'effectiveFrom', "TEXT NOT NULL DEFAULT (date('now'))");
  await ensureColumn(database, 'enrollments', 'effectiveTo', 'TEXT');
  await ensureColumn(database, 'academic_years', 'status', "TEXT NOT NULL DEFAULT 'active'");
  await ensureColumn(database, 'users', 'signatureData', 'TEXT');
  await ensureColumn(database, 'users', 'createdAt', "TEXT NOT NULL DEFAULT (datetime('now'))");
  await ensureColumn(database, 'subjects', 'description', "TEXT DEFAULT ''");
}

export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM audit_logs;
    DELETE FROM records;
    DELETE FROM enrollments;
    DELETE FROM students;
    DELETE FROM sections;
    DELETE FROM subjects;
    DELETE FROM academic_years;
    DELETE FROM users;
    PRAGMA user_version = 0;
  `);
}
