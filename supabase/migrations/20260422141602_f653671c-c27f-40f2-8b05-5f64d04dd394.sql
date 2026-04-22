
ALTER TABLE public.resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey;
ALTER TABLE public.resume_analyses DROP CONSTRAINT IF EXISTS resume_analyses_user_id_fkey;
ALTER TABLE public.ats_results DROP CONSTRAINT IF EXISTS ats_results_user_id_fkey;
ALTER TABLE public.soft_skill_analyses DROP CONSTRAINT IF EXISTS soft_skill_analyses_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
