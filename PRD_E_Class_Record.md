# PRD — ClassKard

**Product type:** Teacher-focused digital class record / five-index-card organizer  
**Status:** Product Requirements Draft  
**Version:** 1.0  
**Date:** 2026-09-08

## 1. Product Name

### Recommended name: ClassKard

**Meaning:** “Class” + “Kard/Card,” directly communicating the app’s core idea: replacing the five physical student index cards with organized digital cards.

**Tagline:** **Five cards. One organized class record.**

> Naming note: I recommend **ClassKard** over **E-Class Record**. “E-Class Record” is already strongly associated with DepEd’s Electronic Class Record templates, so it would be less distinctive as a product name. DepEd officially publishes E-Class Record templates, and the term is already used broadly for that system. 

A web search also found existing products named **ClassNest**, **Klasora**, and **ClassLedger**, so those names were avoided. The name **ClassKard** is a design/product recommendation based on the search performed for this PRD; this is **not a trademark, company-registry, domain, or app-store clearance**.

---

## 2. Product Overview

ClassKard is a teacher-centered digital record system designed to organize each student’s **five individual index cards** into one structured digital profile.

The five cards are:

1. **Attendance**
2. **Laboratory Activities / Participation**
3. **Quizzes / Short Quizzes**
4. **Midterm / Final Exam**
5. **Assignments / Case Studies**

The system is intended to solve the practical problem of managing many physical index cards across multiple sections. Instead of searching through stacks of cards, the teacher can navigate from **class/section → student → one of five digital cards → dated records**.

Every record can contain a date and a teacher digital signature. Signed records should be locked against silent modification and retained as part of the student’s history.

---

## 3. Problem Statement

A teacher may handle multiple sections with dozens of students per section. Each student has five separate index cards, creating a large number of records to sort, update, verify, and retrieve.

The current physical process can cause:

- Difficulty locating a specific student’s card.
- Cards becoming mixed between sections.
- Repetitive writing for recurring activities.
- Difficulty reviewing a student’s full history.
- Risk of missing dates or signatures.
- Difficulty preserving old records.
- Slow bulk entry when an entire class completes the same activity.

ClassKard should preserve the familiar concept of five index cards while removing the physical organization burden.

---

## 4. Product Goals

### Primary goals

- Digitize the five index cards for every student.
- Organize records by school year, subject/course, section, student, and category.
- Make daily/dated recording fast.
- Make records searchable and filterable.
- Support digital teacher signatures.
- Prevent signed records from being silently changed.
- Enable bulk/class-wide entry for activities involving many students.
- Make historical records easy to review.
- Reduce visual and cognitive overload for teachers.

### Secondary goals

- Provide printable/exportable records when needed.
- Provide summary views without replacing the underlying five-card record structure.
- Maintain a clean audit trail for edits and signatures.

### Non-goals for the MVP

- Full school management system.
- Payroll or HR management.
- Tuition/finance management.
- Parent communication platform.
- Student learning management system.
- Automated grading policy decisions.

---

## 5. Target User

### Primary user

**Teacher / Instructor**

A teacher who manages one or more subjects and several sections, and needs to record student performance and participation using five recurring categories.

### Secondary user

**System administrator**

An administrator who manages users, school-year data, permissions, backups, and system configuration.

### Secondary user

**Student** — registers an account, enrolls/joins an authorized teacher section, and views their own five digital index cards and history. Students cannot modify teacher-verified academic records.

---

## 6. Core Information Architecture

```text
Teacher Dashboard
│
├── School Year
│   └── Subject / Course
│       └── Section
│           └── Students
│               └── Student Profile
│                   ├── Card 1 — Attendance
│                   ├── Card 2 — Laboratory / Participation
│                   ├── Card 3 — Quizzes / Short Quizzes
│                   ├── Card 4 — Midterm / Final Exam
│                   └── Card 5 — Assignments / Case Studies
│
├── Quick Entry
├── Calendar / Recent Records
├── Search
├── Reports
└── Settings
```

---

## 7. Main User Flow

### 7.1 Setup

1. Teacher signs in.
2. Teacher creates/selects a school year.
3. Teacher creates/selects a subject/course.
4. Teacher creates/imports sections.
5. Teacher adds/imports students into each section.
6. Every student automatically receives the five digital index cards.

### 7.2 Individual student recording

1. Open section.
2. Search/select student.
3. Open one of the five digital cards.
4. Tap **Add Record**.
5. Enter record details.
6. Date is selected automatically from the current date but remains editable where appropriate.
7. Teacher reviews the record.
8. Teacher applies digital signature.
9. Signed record becomes locked.

### 7.3 Class-wide recording

1. Open **Quick Entry**.
2. Select section.
3. Select card/category.
4. Select activity/record type.
5. Set date.
6. Display all students in the section.
7. Enter scores/statuses efficiently in a table/grid.
8. Review.
9. Save.
10. Apply teacher digital signature to the submitted batch/records.

Example:

```text
BSIT 2A — Quiz #3
Date: September 8, 2026

Student              Score
Juan Dela Cruz       18/20
Maria Santos         20/20
Pedro Cruz           16/20
Ana Reyes            19/20

[ Review ] [ Save & Sign ]
```

---

## 8. Five Digital Index Cards

## 8.1 Card 1 — Attendance

### Purpose
Track student attendance history.

### Fields

- Record ID
- Student ID
- Section ID
- Date
- Status
  - Present
  - Absent
  - Late
  - Excused
- Time-in (optional)
- Time-out (optional)
- Remarks (optional)
- Teacher signature
- Signed date/time
- Created date/time
- Updated date/time
- Record status: Draft / Signed / Locked

### Preferred UI
A calendar/table hybrid:

```text
Attendance

Date          Status       Remarks       Signed
09/01/2026    Present      —             ✓
09/03/2026    Late         10 minutes    ✓
09/05/2026    Present      —             ✓
```

---

## 8.2 Card 2 — Laboratory Activities / Participation

### Purpose
Record laboratory work, class participation, practical activities, and similar performance records.

### Fields

- Activity title
- Activity number/code (optional)
- Date
- Score (optional)
- Maximum score (optional)
- Rating (optional)
- Participation status/type (optional)
- Remarks
- Teacher signature
- Signed date/time
- Record status

### Example

```text
Laboratory Activity #2
Date: September 8, 2026
Score: 18 / 20
Remarks: Completed practical task
Signed: ✓
```

---

## 8.3 Card 3 — Quizzes / Short Quizzes

### Purpose
Track quizzes and short quizzes without forcing the teacher to create one giant grade sheet.

### Fields

- Quiz title/number
- Quiz type: Quiz / Short Quiz
- Date
- Score
- Total items
- Percentage (calculated)
- Remarks
- Teacher signature
- Signed date/time
- Record status

### Calculated field

```text
Percentage = Score / Total Items × 100
```

---

## 8.4 Card 4 — Midterm / Final Exam

### Purpose
Store formal exam records.

### Fields

- Exam type: Midterm / Final
- Exam title/code
- Date
- Score
- Total items
- Percentage (calculated)
- Remarks
- Teacher signature
- Signed date/time
- Record status

The app should not automatically change official grading weights unless those rules are explicitly configured by the school/teacher in a future grading module.

---

## 8.5 Card 5 — Assignments / Case Studies

### Purpose
Record individual or group assignments, case studies, submissions, and similar requirements.

### Fields

- Activity title
- Activity type: Assignment / Case Study / Other
- Date assigned (optional)
- Due date (optional)
- Date submitted
- Status
  - Submitted
  - Late
  - Missing
  - Excused
  - Not yet submitted
- Score (optional)
- Maximum score (optional)
- Remarks
- Teacher signature
- Signed date/time
- Record status

---

## 9. Student Profile

Every student receives a single profile containing the five cards.

### Student information

- Student ID
- Full name
- First name
- Middle name
- Last name
- Section
- Program/grade level (optional)
- Year level (optional)
- Academic year
- Profile status: Active / Archived

### Student profile screen

```text
┌──────────────────────────────────┐
│ Juan Dela Cruz                   │
│ BSIT 2A • SY 2026–2027           │
├──────────────────────────────────┤
│                                  │
│  Attendance            18 records│
│  Laboratory             7 records│
│  Quizzes                5 records│
│  Exams                  2 records│
│  Assignments            8 records│
│                                  │
└──────────────────────────────────┘
```

A **View All History** button should show a chronological timeline across all five cards.

---

## 10. Student Record Timeline

A student should have a unified timeline that combines all five cards.

Example:

```text
SEPTEMBER 2026

Sep 01   Attendance       Present             ✓ Signed
Sep 03   Quiz #1          18/20               ✓ Signed
Sep 04   Laboratory #1    20/20               ✓ Signed
Sep 06   Assignment #1   Submitted            ✓ Signed
Sep 08   Attendance       Late                 ✓ Signed
```

Filters:

- Date range
- Card/category
- Activity type
- Signed/Unsigned
- Search keyword

---

## 11. Digital Signature

### Requirement
Every finalized record must support the teacher’s digital signature.

### Signature flow

```text
Save Draft
   ↓
Review Record
   ↓
Sign
   ↓
Store signature + date/time
   ↓
Lock record
```

### Signature metadata

- Teacher user ID
- Teacher display name
- Signature image/vector or approved signature method
- Signed date
- Signed timestamp
- Record ID
- Signature version/hash if implemented

### Locking behavior

After signing:

- Record becomes read-only.
- Normal edit button disappears.
- UI displays a clear **Signed & Locked** status.
- Any correction must create an audit event or follow an administrator-approved correction workflow.

### Important product rule

The app should distinguish between a simple visual signature and a legally recognized electronic/digital signature. The MVP should treat the feature as a **teacher approval/signing mechanism**, and institutional/legal requirements should be validated before marketing it as a legally binding digital signature.

---

## 12. Search and Organization

Search must work globally within the teacher’s authorized data.

### Search by

- Student name
- Student ID
- Section
- Activity name
- Record type
- Date

### Filters

- School year
- Subject
- Section
- Card category
- Date range
- Record status

### Design principle

**Never show every record at once.**

The interface should progressively reveal information:

```text
Section → Student → Card → Date/Activity → Record
```

This is the main strategy for preventing teacher overload.

---

## 13. Quick Entry / Bulk Entry

This is a priority feature because it removes repetitive work.

### Supported bulk-entry scenarios

#### Attendance
Select a date and mark the full class quickly.

```text
[✓ Mark all Present]
```

Then adjust individual exceptions:

```text
Juan       Present
Maria      Present
Pedro      Late
Ana        Absent
```

#### Quiz
Enter scores for the whole section in a grid.

#### Laboratory activity
Enter scores/ratings for the whole section.

#### Assignment
Set submission status for all students, then change exceptions.

### Bulk action

```text
Save Draft → Review → Sign → Lock
```

---

## 14. Dashboard

The dashboard should answer one question immediately:

**“What class/record do I need to work on today?”**

### Dashboard components

- Current school year
- Current subject/course
- Section cards
- Student count
- Unsigned records
- Recent records
- Today’s quick actions
- Search
- Quick Entry button

### Example

```text
Good afternoon, Prof. Santos

SY 2026–2027

My Classes

BSIT 2A     45 students
BSIT 2B     42 students
BSIT 2C     48 students

Today

[ Attendance ] [ Quick Entry ]

Needs Attention

• 6 unsigned records
• 2 incomplete activity records
```

---

## 15. Records Status

Each record should have one of these states:

| Status | Meaning |
|---|---|
| Draft | Entered but not finalized |
| Ready to Sign | Complete and awaiting teacher approval |
| Signed | Teacher has signed the record |
| Locked | Signed record cannot be normally edited |
| Corrected | Original retained; correction recorded through audit trail |
| Archived | Belongs to an old/closed academic context |

---

## 16. Audit Trail

The system should retain meaningful record history.

### Audit events

- Record created
- Record edited
- Record signed
- Record unlocked by authorized administrator
- Record corrected
- Record archived
- Student moved/assigned to section

### Example

```text
Quiz #3

Created by: Prof. Santos
Created: Sep 8, 2026 4:10 PM
Signed: Sep 8, 2026 4:15 PM
Status: Locked
```

---

## 17. Academic Year and Section Management

The system must prevent records from becoming mixed between school years or sections.

### Suggested hierarchy

```text
School
└── Academic Year
    └── Teacher
        └── Subject
            └── Section
                └── Students
                    └── Five Cards
```

### Student transfer behavior

If a student moves sections:

- Do not duplicate historical records.
- Preserve previous section context.
- Give the student a new section association effective on a defined date.
- Keep old records attached to their original section context.

---

## 18. Reports and Export

### MVP reports

- Student five-card summary
- Section record summary
- Attendance summary
- Quiz summary
- Laboratory summary
- Exam summary
- Assignment summary
- Unsigned-record report
- Date-range record report

### Export options

- PDF
- CSV
- Excel-compatible spreadsheet

### Printable student card

The system should be able to generate a printable representation of the five digital cards for archiving or submission when needed.

---

## 19. Notifications

MVP notifications should remain simple.

Possible notifications:

- Unsigned records reminder
- Incomplete record reminder
- Backup/sync status
- Import completed
- Export completed

Avoid excessive notifications.

---

## 20. Student Enrollment & Self-Service Workflow

A core product principle is **“enter student information once, then let the student maintain their own enrollment profile.”** The teacher should not need to manually encode the same student into every section.

### 20.1 Student registration

A student can create an account using:

- Email + password
- Student number
- Full name
- Program/year level (optional, depending on school configuration)

The student account should require email verification if email authentication is used.

### 20.2 Joining a teacher’s class

The teacher creates a section and generates a **unique class code / enrollment code** or shareable join link.

Student flow:

```text
Register / Sign in
      ↓
Join Class
      ↓
Enter Class Code
      ↓
Confirm Subject + Section + Teacher
      ↓
Submit Enrollment Request
      ↓
Teacher Approves (or Auto-Approve if enabled)
      ↓
Student becomes enrolled
      ↓
Five digital index cards become available
```

### 20.3 Teacher approval modes

Each section can use one of two enrollment modes:

**Approval required (recommended default)**
- Student enters class code.
- Request appears in teacher’s “Enrollment Requests.”
- Teacher verifies student number/name.
- Teacher approves or rejects.

**Auto-approve**
- Student joins using a valid one-time/active class code.
- Useful for controlled classes where the code is only given to the enrolled students.

### 20.4 Student dashboard

After approval, the student sees only their own information and authorized classes.

Example:

```text
My Classes

BSIT 2A
Web Systems — Prof. Santos

[ My Five Cards ]
[ Activity History ]
```

### 20.5 Student five-card view

Students can view their own:

1. Attendance
2. Laboratory Activities / Participation
3. Quizzes / Short Quizzes
4. Midterm / Final Exam
5. Assignments / Case Studies

Each card shows dated records, score/status, remarks that the teacher has chosen to expose, and signature/verification status.

Students are **read-only** for teacher-entered academic records.

### 20.6 What students may edit

Students may edit limited profile information such as:

- Preferred display name (if institution allows)
- Profile photo (optional)
- Contact email (subject to verification)

Students may not edit:

- Scores
- Attendance status
- Teacher remarks
- Teacher signatures
- Signed/locked records

### 20.7 Student enrollment reduces teacher encoding

Instead of this:

```text
Teacher creates Section
 ↓
Teacher manually types 45 students
 ↓
Teacher creates five cards for each student
 ↓
45 × 5 = 225 card assignments
```

The recommended workflow is:

```text
Teacher creates Section
 ↓
System generates class code
 ↓
Students register and join
 ↓
Teacher approves requests
 ↓
System automatically creates enrollment + five card views
```

The teacher then focuses on recording academic activity instead of repeatedly encoding student identities.

### 20.8 Student enrollment request screen

```text
Join a Class

Class Code
[ 7X4-KP2 ]

Subject: Web Systems
Section: BSIT 2A
Teacher: Prof. Santos

[ Request to Join ]
```

### 20.9 Teacher enrollment request screen

```text
Enrollment Requests — BSIT 2A

Juan Dela Cruz
Student No. 2026-00123
[ Approve ] [ Reject ]

Maria Santos
Student No. 2026-00124
[ Approve ] [ Reject ]

[ Approve Selected ]
```

### 20.10 Duplicate and fraud prevention

The system should prevent the same student account from being enrolled twice in the same section.

Recommended controls:

- Unique student number per institution/tenant, where applicable.
- One active enrollment per student per section unless the system explicitly supports re-enrollment.
- Enrollment audit log.
- Class codes can expire or be regenerated.
- Teacher can revoke an enrollment.
- Student can leave a pending/unapproved request.

### 20.11 Enrollment lifecycle

```text
Pending → Approved → Active → Completed / Dropped / Revoked
```

Historical academic records remain attached to the original enrollment context even if a student later leaves or changes sections.

---

## 20. Authentication and Roles

### Teacher

Can:

- Create and manage assigned sections.
- Generate and manage class enrollment codes.
- Approve/reject student enrollment requests.
- View enrolled students.
- Create academic records.
- Sign records.
- Lock finalized records.
- View student history.
- Export authorized records.
- Remove/revoke a student enrollment when appropriate.

### Student

Can:

- Register and sign in.
- Join classes using a class code or approved join link.
- Submit enrollment requests.
- View approved classes.
- View their own five digital index cards.
- View their own activity/history.
- See teacher signature/verification status.

Cannot:

- Add or modify official academic records.
- Change scores.
- Change attendance.
- Modify teacher remarks.
- Add/modify teacher signatures.
- View another student’s records.

### Administrator

Can:

- Manage teachers.
- Manage academic years.
- Manage sections.
- Manage subjects.
- Manage students.
- Configure permissions.
- Review audit logs.
- Handle approved record corrections.

### Future student role

May be added as read-only access to selected records.

---

## 21. Privacy and Security Requirements

Student records are sensitive educational data and must be protected appropriately.

### Minimum requirements

- Authenticated access.
- Role-based authorization.
- Least-privilege data access.
- Secure storage.
- Encrypted network communication.
- Audit logging for sensitive changes.
- Protected backups.
- Session timeout/secure logout.
- No public student-record URLs.
- Do not expose student data in client logs.

For a real institutional deployment, data protection, retention, access, and disclosure rules should be reviewed against the school’s policies and applicable Philippine requirements before production use.

---

## 22. Offline Capability

### Recommended

Because teachers may not always have reliable connectivity, the app should eventually support offline-first record entry.

### Offline behavior

1. Teacher opens an assigned section.
2. Existing authorized records are cached locally.
3. Teacher records attendance/scores while offline.
4. Records are saved locally as pending sync.
5. When connection returns, records synchronize.
6. Conflicts are detected instead of silently overwritten.
7. Teacher sees sync status.

### Sync states

```text
Synced ✓
Pending sync ⟳
Conflict !
Failed sync ×
```

Offline support can be MVP+ depending on the selected technology stack.

---

## 23. Data Model

### User

```text
User
- id
- name
- email
- role
- signature
- status
- createdAt
```

### AcademicYear

```text
AcademicYear
- id
- name
- startDate
- endDate
- status
```

### Subject

```text
Subject
- id
- code
- name
- description
```

### Section

```text
Section
- id
- academicYearId
- subjectId
- teacherId
- name
- status
```

### Student

```text
Student
- id
- studentNumber
- firstName
- middleName
- lastName
- status
```

### Enrollment

```text
Enrollment
- id
- studentId
- sectionId
- effectiveFrom
- effectiveTo
- status
```

### Record

A unified record model can power all five cards.

```text
Record
- id
- studentId
- sectionId
- category
- recordType
- title
- date
- score
- totalScore
- percentage
- status
- remarks
- createdBy
- createdAt
- updatedAt
- signedBy
- signedAt
- signatureData
- lockedAt
```

### Categories

```text
ATTENDANCE
LABORATORY
QUIZ
EXAM
ASSIGNMENT
```

### AuditLog

```text
AuditLog
- id
- recordId
- actorId
- action
- oldValue
- newValue
- timestamp
- reason
```

---

## 24. UX Principles

### 1. Five-card mental model

The app must visually preserve the concept of the teacher’s five index cards.

### 2. Progressive disclosure

Do not put everything on one screen.

### 3. Search-first navigation

Teachers should be able to reach a student quickly without scrolling through long lists.

### 4. Bulk entry before repetitive individual entry

Whenever the activity applies to an entire section, make the class-wide workflow the fastest option.

### 5. Clear record states

Draft, signed, locked, and corrected should be visually obvious.

### 6. Touch-friendly controls

Large buttons and simple forms should be used, especially for mobile/tablet usage.

### 7. Minimal typing

Use dropdowns, quick statuses, numeric keyboards, defaults, and reusable activity templates.

---

## 25. Suggested Navigation

### Mobile/tablet

```text
Home
Classes
Quick Entry
Records
Reports
Settings
```

### Desktop

```text
Sidebar
├── Dashboard
├── My Classes
├── Students
├── Quick Entry
├── Records
├── Reports
└── Settings
```

---

## 26. Key Screens

### Authentication

1. Splash
2. Login
3. Forgot Password

### Teacher setup

4. School/Teacher profile
5. Academic year
6. Subject setup
7. Section management
8. Student import/add

### Main experience

9. Dashboard
10. My Classes
11. Section Details
12. Student List
13. Student Profile
14. Five-Card Overview
15. Attendance Card
16. Laboratory Card
17. Quiz Card
18. Exam Card
19. Assignment Card
20. Unified Student Timeline

### Data entry

21. Add Record
22. Edit Draft
23. Quick Entry
24. Bulk Score Entry
25. Review & Sign
26. Signature screen
27. Signed/Locked record

### Management

28. Search
29. Filters
30. Reports
31. Export
32. Audit Trail
33. Settings

### Student screens

34. Student Registration
35. Student Login
36. Student Dashboard
37. Join Class
38. Enrollment Request Status
39. My Classes
40. My Five Cards
41. Student Card Detail
42. Student Activity Timeline
43. Student Profile

---

## 27. MVP Scope

### Must-have

- Teacher authentication.
- School year management.
- Subject management.
- Section management.
- Student management.
- Automatic five-card structure per student.
- Attendance records.
- Laboratory/participation records.
- Quiz records.
- Exam records.
- Assignment/case-study records.
- Date-based records.
- Digital teacher signature/approval.
- Signed-record locking.
- Search.
- Filters.
- Student timeline.
- Basic dashboard.
- Basic audit trail.
- PDF/CSV export.

### Should-have

- Bulk entry.
- Attendance “mark all present.”
- CSV/Excel student import.
- Record templates.
- Offline draft entry.
- Backup and restore.

### Could-have

- Analytics.
- Student portal.
- Parent portal.
- QR-based attendance.
- Notifications.
- Calendar integration.
- Advanced grade computation.

### Won’t-have initially

- Full LMS.
- Messaging/social features.
- Tuition payment system.
- School-wide ERP.

---

## 28. Success Metrics

The product succeeds when a teacher can:

- Find any student in under 10 seconds.
- Open any of the five cards in two or fewer navigation steps after selecting a student.
- Record an individual entry in under 30 seconds for routine records.
- Record an entire class activity without opening students one by one.
- Identify unsigned records immediately.
- Retrieve a student’s complete historical record by date/category.
- Understand whether a record is draft, signed, or locked without opening it.

---

## 29. Example End-to-End Scenario

### Scenario: Quiz day

Teacher opens ClassKard.

```text
Dashboard
 ↓
BSIT 2A
 ↓
Quick Entry
 ↓
Quizzes / Short Quizzes
 ↓
Quiz #3
 ↓
Date: September 8, 2026
 ↓
Enter scores for all students
 ↓
Review
 ↓
Sign
 ↓
Locked
```

The system automatically creates one Quiz record for every student entered in the batch, linked to their Quiz Index Card.

### Scenario: Checking one student

```text
Dashboard
 ↓
Search “Juan Dela Cruz”
 ↓
Student Profile
 ↓
Five Cards
 ↓
Quizzes
 ↓
Quiz #3
```

No physical card searching is required.

---

## 30. Recommended Visual Direction

### Brand personality

- Professional
- Clean
- Teacher-friendly
- Modern
- Calm
- Organized
- Not overly corporate

### UI concept

The five cards can use five subtle visual identities while maintaining one design system:

- Attendance — calendar/check concept
- Laboratory — flask/activity concept
- Quizzes — quiz/checklist concept
- Exams — assessment/document concept
- Assignments — task/document concept

Avoid using too many saturated colors. The cards should feel like one unified filing system.

### Signature UX

Make signing feel deliberate:

```text
Review Record

Everything looks correct?

[ Sign & Lock ]
```

The application should never make it easy to accidentally sign the wrong date or student.

---

## 31. Recommended Technical Direction

The exact stack can be decided after confirming the target device/platform.

### Recommended architecture for a student/developer MVP

**Option A — Android-first:**
- Kotlin
- Jetpack Compose
- Room for local data
- Firebase Authentication
- Firestore for cloud data
- Firebase Storage for signature assets if needed

**Option B — Cross-platform:**
- Flutter
- SQLite/Drift for local storage
- Firebase Authentication
- Firestore
- Firebase Storage

**Architecture principle:** local-first data layer + synchronized cloud backend.

Do not make the UI directly dependent on a live network request for every button press.

---

## 32. Recommended Database Strategy

Use a normalized relationship concept even if Firestore is selected.

```text
School Year
   ↓
Subject
   ↓
Section
   ↓
Student Enrollment
   ↓
Student
   ↓
Records
```

The five cards are a **logical UI grouping**, not necessarily five separate database tables.

This avoids unnecessary duplication while keeping the user experience faithful to the physical five-card workflow.

---

## 33. Important Business Rules

1. Every active student in a section has exactly five logical cards.
2. A card can contain many dated records.
3. A record belongs to one student and one section context.
4. A draft can be edited.
5. A signed record becomes locked.
6. Corrections must preserve the original history.
7. Records from different school years must remain separated.
8. Student section changes must preserve historical context.
9. Bulk-created records must still be individually traceable to students.
10. The current date may be the default, but the record date must be explicitly visible before signing.
11. Teacher identity must be associated with every signature.
12. Deleting records should be restricted; archival/correction is preferred for signed records.

---

## 34. Future Enhancements

### Smart attendance

Automatically suggest “Present” for the class and let the teacher mark exceptions.

### Activity templates

Teacher can save reusable activities:

```text
Laboratory Activity
- Activity name template
- Default maximum score: 20
```

### Recurring activities

Create recurring attendance or activity sessions quickly.

### Analytics

Show a student’s performance across the five cards without replacing the original record history.

### Import existing records

Import spreadsheet data into the appropriate five cards.

### Printable five-card packet

Generate a PDF that visually resembles the teacher’s physical five-card system.

---

## 35. Product Positioning

### One-line description

**ClassKard is a digital five-index-card organizer that helps teachers manage student attendance, activities, quizzes, exams, and assignments by date—without the clutter of physical cards.**

### Core value proposition

**Keep the familiar five-card system. Lose the paper chaos.**

---

## 36. Name Alternatives Considered

| Name | Recommendation | Reason |
|---|---|---|
| E-Class Record | Not preferred | Strongly associated with existing DepEd Electronic Class Record terminology/templates. |
| ClassNest | Reject | Existing education products use this name. |
| Klasora | Reject | Existing school-management product uses this name. |
| ClassLedger | Reject | Existing class-record/lesson tracking product uses this name. |
| ClassKard | **Recommended** | Directly communicates the five-card concept and has a distinctive spelling. |

---

## 37. Acceptance Criteria — MVP

The MVP is considered functionally complete when:

- A teacher can log in.
- A teacher can create a school year, subject, and section.
- A teacher can add/import students.
- Every student displays five cards.
- A teacher can create dated records under every card.
- A teacher can sign a record.
- A signed record displays the signed date/time and signer.
- A signed record cannot be normally edited.
- A teacher can search a student.
- A teacher can filter records by date/category.
- A teacher can view all five cards from one student profile.
- A teacher can view the student’s complete chronological history.
- A teacher can perform at least one bulk-entry workflow.
- Basic exports work.
- Audit data is retained for important record events.

---

## 38. Future Questions to Confirm Before Development

These are intentionally left open because they affect the final UI/data model:

1. Is the app **Android only**, web, or both?
2. Will the teacher manage one subject or multiple subjects?
3. Can one teacher handle many sections simultaneously?
4. Is the five-card format required to match a physical card/template exactly?
5. Does every card have an existing handwritten format that needs to be replicated?
6. Should students see their records?
7. Should the teacher sign every individual record or sign a whole batch/session?
8. Should the system support multiple teachers for the same section?
9. Should records be usable offline?
10. What exact type of digital signature is acceptable for the school’s workflow?

---

## 39. MVP Priority Order

### Phase 1 — Core

Authentication → Academic Year → Subject → Section → Students → Five Cards

### Phase 2 — Recording

Attendance → Laboratory → Quiz → Exam → Assignment

### Phase 3 — Trust & Organization

Date history → Digital signature → Locking → Search → Filters → Audit trail

### Phase 4 — Speed

Quick Entry → Bulk Entry → Import → Activity templates

### Phase 5 — Output

Reports → PDF → CSV/Excel export → Printable five-card format

### Phase 6 — Reliability

Offline mode → Sync → Conflict resolution → Backup/restore

---

## 40. Final Product Concept

ClassKard should feel less like a complicated school-management system and more like the teacher’s **digital filing cabinet for five index cards per student**.

The core interaction should always remain simple:

```text
SELECT CLASS
      ↓
SELECT STUDENT
      ↓
SELECT ONE OF FIVE CARDS
      ↓
VIEW / ADD DATED RECORD
      ↓
SIGN
      ↓
LOCK
```

For repetitive class work:

```text
SELECT CLASS
      ↓
SELECT ACTIVITY
      ↓
ENTER WHOLE CLASS
      ↓
REVIEW
      ↓
SIGN
      ↓
LOCK
```

That distinction—**individual student view for review, class-wide view for repetitive entry**—is the central UX idea of ClassKard.

---

## Sources / Naming Research

- Department of Education — Electronic Class Record Templates: confirms that “E-Class Record” is already an established DepEd term and template family. 
- ClassNest search results: existing education/class platform using the ClassNest name.
- Klasora search results: existing school management system using the Klasora name.
- ClassLedger search results: existing class/lesson tracking product using the ClassLedger name.

These searches were used only to reduce obvious naming collisions. A proper trademark, business-name, domain, social-handle, and app-store availability check should be completed before commercial release.


## 31. Student Role — Acceptance Criteria

The student workflow is successful when:

1. A student can register without teacher manually creating the account.
2. A teacher can create a class code for each section.
3. A student can enter the code and identify the correct subject, section, and teacher before joining.
4. The teacher can approve multiple enrollment requests efficiently.
5. Approved students automatically appear in the section roster.
6. The system automatically provides the five card categories for each approved enrollment.
7. A student can view only their own records.
8. A student cannot modify official attendance, scores, remarks, signatures, or locked records.
9. The teacher no longer needs to manually create duplicate student/card records one by one.
10. Enrollment changes and approvals are auditable.

## 32. Recommended Product Direction

The student role should be included in the **MVP**, not treated as a later add-on. It directly addresses one of the product’s central goals: reducing teacher administrative work.

The recommended MVP relationship is:

```text
             ┌─────────────────┐
             │     TEACHER     │
             └────────┬────────┘
                      │
               Creates Section
                      │
               Generates Code
                      │
          ┌───────────┴───────────┐
          │                       │
     Student A                Student B
      Register                 Register
          │                       │
       Join Code               Join Code
          │                       │
          └───────────┬───────────┘
                      │
               Teacher Approval
                      ↓
                 Enrollment
                      ↓
              Five Digital Cards
                      ↓
          ┌───────────┴───────────┐
          │                       │
       Teacher                 Student
       records                views own cards
       + signs
```

This creates a clean division of responsibility: **students establish their enrollment identity; teachers manage and verify academic records.**
