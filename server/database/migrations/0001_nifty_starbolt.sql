ALTER TABLE "questions" DROP CONSTRAINT "questions_author_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE POLICY "users can create questions" ON "questions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = "questions"."author_id");--> statement-breakpoint
CREATE POLICY "users can read questions" ON "questions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);