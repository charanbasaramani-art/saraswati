
-- Drop existing auth-based policies on resumes
DROP POLICY IF EXISTS "Users can manage their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Admins can view all resumes" ON public.resumes;
DROP POLICY IF EXISTS "Recruiters can view all resumes" ON public.resumes;
CREATE POLICY "Public can manage resumes" ON public.resumes FOR ALL USING (true) WITH CHECK (true);

-- resume_analyses
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Admins can view all analyses" ON public.resume_analyses;
DROP POLICY IF EXISTS "Recruiters can view all resume analyses" ON public.resume_analyses;
CREATE POLICY "Public can manage resume analyses" ON public.resume_analyses FOR ALL USING (true) WITH CHECK (true);

-- ats_results
DROP POLICY IF EXISTS "Users can view their own ATS results" ON public.ats_results;
DROP POLICY IF EXISTS "Users can create their own ATS results" ON public.ats_results;
DROP POLICY IF EXISTS "Recruiters can view all ATS results" ON public.ats_results;
CREATE POLICY "Public can manage ATS results" ON public.ats_results FOR ALL USING (true) WITH CHECK (true);

-- soft_skill_analyses
DROP POLICY IF EXISTS "Users can view their own soft skill analyses" ON public.soft_skill_analyses;
DROP POLICY IF EXISTS "Users can create their own soft skill analyses" ON public.soft_skill_analyses;
DROP POLICY IF EXISTS "Recruiters can view all soft skill analyses" ON public.soft_skill_analyses;
CREATE POLICY "Public can manage soft skill analyses" ON public.soft_skill_analyses FOR ALL USING (true) WITH CHECK (true);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can view all profiles" ON public.profiles;
CREATE POLICY "Public can manage profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- user_roles (read only public)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Public can view roles" ON public.user_roles FOR SELECT USING (true);

-- Storage buckets - resumes
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public can manage resumes bucket" ON storage.objects;
CREATE POLICY "Public can manage resumes bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'resumes')
  WITH CHECK (bucket_id = 'resumes');

-- Storage buckets - avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can manage avatars bucket" ON storage.objects;
CREATE POLICY "Public can manage avatars bucket"
  ON storage.objects FOR ALL
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');
