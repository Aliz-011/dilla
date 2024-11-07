CREATE TYPE "public"."status" AS ENUM('present', 'absent', 'late', 'on_leave');--> statement-breakpoint
ALTER TABLE "attendances" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "attendances" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendances_user_id_index" ON "attendances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "photos_user_id_index" ON "photos" USING btree ("user_id");