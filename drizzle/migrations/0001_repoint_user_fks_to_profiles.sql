ALTER TABLE public.exchange_requests
  DROP CONSTRAINT exchange_requests_sender_id_fkey,
  DROP CONSTRAINT exchange_requests_receiver_id_fkey,
  ADD CONSTRAINT exchange_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT exchange_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.skills
  DROP CONSTRAINT skills_user_id_fkey,
  ADD CONSTRAINT skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
  DROP CONSTRAINT reviews_reviewer_id_fkey,
  DROP CONSTRAINT reviews_reviewee_id_fkey,
  ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;