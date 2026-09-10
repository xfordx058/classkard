-- RLS adjustments required by the app's flows

-- users: any authenticated user may read profiles (needed for teacherName
-- lookups during class join and roster displays). Writes stay self-scoped.
drop policy if exists "users can read own profile" on public.users;
create policy "users readable by all signed in users"
on public.users for select
using (auth.uid() is not null);

create policy "users can insert own profile"
on public.users for insert
with check (auth_id = auth.uid());

-- students: a student may insert their own student row while registering,
-- and may read/update their own profile record.
create policy "students can insert own row"
on public.students for insert
with check (
  user_id = (select u.id from public.users u where u.auth_id = auth.uid())
);

create policy "student updates own profile"
on public.students for update
using (user_id = (select u.id from public.users u where u.auth_id = auth.uid()))
with check (user_id = (select u.id from public.users u where u.auth_id = auth.uid()));

-- records: allow a student to update their own records (signAction / signRecord).
-- RLS cannot scope column changes, so this permits status/signature mutations
-- on rows that belong to the student.
create policy "student updates own records"
on public.records for update
using (
  exists (
    select 1 from public.students st
    join public.users u on u.id = st.user_id
    where u.auth_id = auth.uid() and st.id = student_id
  )
);

-- users join helper: teachers also need to read all user rows (roster names).
-- This is already covered by the broad SELECT policy above.