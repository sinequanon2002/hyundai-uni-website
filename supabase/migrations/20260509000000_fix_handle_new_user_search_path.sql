-- SECURITY DEFINER 함수에 search_path를 명시하지 않으면 Supabase Auth 서비스에서
-- profiles 테이블을 찾지 못해 "Database error saving new user" 오류가 발생함.
-- search_path를 고정하고 완전 경로(public.profiles)를 사용하도록 재정의.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;
