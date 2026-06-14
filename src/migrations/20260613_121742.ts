import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_plans_status" AS ENUM('active', 'paused', 'completed');
  CREATE TYPE "public"."enum_workout_groups_protocol" AS ENUM('standard', 'emom', 'amrap', 'for_time', 'tabata');
  CREATE TYPE "public"."enum_workout_exercise_rows_override_protocol" AS ENUM('', 'standard', 'emom', 'amrap', 'for_time', 'tabata');
  CREATE TYPE "public"."enum_round_logs_status" AS ENUM('completed', 'partial', 'skipped');
  CREATE TYPE "public"."enum_exercises_tracking_type" AS ENUM('strength', 'cardio');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "clients_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_id" integer,
  	"status" "enum_plans_status" DEFAULT 'active',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"source" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "microcycles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"plan_id" integer NOT NULL,
  	"rpe" numeric,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workouts_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar
  );
  
  CREATE TABLE "workouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"microcycle_id" integer NOT NULL,
  	"rpe" numeric,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workout_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workout_id" integer NOT NULL,
  	"section_row_id" varchar,
  	"label" varchar,
  	"order" numeric DEFAULT 0,
  	"protocol" "enum_workout_groups_protocol" DEFAULT 'standard',
  	"rounds" varchar,
  	"duration_minutes" numeric,
  	"interval_seconds" numeric DEFAULT 60,
  	"work_seconds" numeric DEFAULT 20,
  	"rest_seconds" numeric DEFAULT 10,
  	"rest_between_rounds" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workout_exercise_rows_set_parameters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"set_number" numeric NOT NULL,
  	"reps" varchar,
  	"kg" varchar
  );
  
  CREATE TABLE "workout_exercise_rows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"group_id" integer NOT NULL,
  	"order" numeric DEFAULT 0,
  	"numer" varchar,
  	"exercise_id" integer,
  	"note" varchar,
  	"rounds" varchar,
  	"reps" varchar,
  	"kg" varchar,
  	"tut" varchar,
  	"rir" varchar,
  	"rest" varchar,
  	"duration_min" numeric,
  	"duration_sec" numeric,
  	"override_protocol" "enum_workout_exercise_rows_override_protocol",
  	"override_rounds" varchar,
  	"override_duration_minutes" numeric,
  	"override_interval_seconds" numeric,
  	"override_work_seconds" numeric,
  	"override_rest_seconds" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workout_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"workout_id" integer NOT NULL,
  	"client_id" integer,
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "round_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" integer NOT NULL,
  	"group_id" integer NOT NULL,
  	"client_id" integer,
  	"round_number" numeric NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"finished_at" timestamp(3) with time zone,
  	"status" "enum_round_logs_status" DEFAULT 'completed',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "set_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_id" integer NOT NULL,
  	"client_id" integer,
  	"exercise_id" integer,
  	"exercise_name" varchar,
  	"exercise_row_id" integer,
  	"round_log_id" integer,
  	"set_number" numeric,
  	"weight" numeric,
  	"distance_m" numeric,
  	"duration_sec" numeric,
  	"reps" varchar,
  	"rir" varchar,
  	"note" varchar,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "exercises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tracking_type" "enum_exercises_tracking_type" DEFAULT 'strength',
  	"description" varchar,
  	"video_url" varchar,
  	"muscle_group" varchar,
  	"equipment" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"clients_id" integer,
  	"media_id" integer,
  	"plans_id" integer,
  	"microcycles_id" integer,
  	"workouts_id" integer,
  	"workout_groups_id" integer,
  	"workout_exercise_rows_id" integer,
  	"workout_logs_id" integer,
  	"round_logs_id" integer,
  	"set_logs_id" integer,
  	"exercises_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"clients_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "clients_sessions" ADD CONSTRAINT "clients_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "plans" ADD CONSTRAINT "plans_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "microcycles" ADD CONSTRAINT "microcycles_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workouts_sections" ADD CONSTRAINT "workouts_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workouts" ADD CONSTRAINT "workouts_microcycle_id_microcycles_id_fk" FOREIGN KEY ("microcycle_id") REFERENCES "public"."microcycles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_groups" ADD CONSTRAINT "workout_groups_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_exercise_rows_set_parameters" ADD CONSTRAINT "workout_exercise_rows_set_parameters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."workout_exercise_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "workout_exercise_rows" ADD CONSTRAINT "workout_exercise_rows_group_id_workout_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."workout_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_exercise_rows" ADD CONSTRAINT "workout_exercise_rows_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "round_logs" ADD CONSTRAINT "round_logs_session_id_workout_logs_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_logs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "round_logs" ADD CONSTRAINT "round_logs_group_id_workout_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."workout_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "round_logs" ADD CONSTRAINT "round_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_id_workout_logs_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_logs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exercise_row_id_workout_exercise_rows_id_fk" FOREIGN KEY ("exercise_row_id") REFERENCES "public"."workout_exercise_rows"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_round_log_id_round_logs_id_fk" FOREIGN KEY ("round_log_id") REFERENCES "public"."round_logs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plans_fk" FOREIGN KEY ("plans_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_microcycles_fk" FOREIGN KEY ("microcycles_id") REFERENCES "public"."microcycles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workouts_fk" FOREIGN KEY ("workouts_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workout_groups_fk" FOREIGN KEY ("workout_groups_id") REFERENCES "public"."workout_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workout_exercise_rows_fk" FOREIGN KEY ("workout_exercise_rows_id") REFERENCES "public"."workout_exercise_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workout_logs_fk" FOREIGN KEY ("workout_logs_id") REFERENCES "public"."workout_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_round_logs_fk" FOREIGN KEY ("round_logs_id") REFERENCES "public"."round_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_set_logs_fk" FOREIGN KEY ("set_logs_id") REFERENCES "public"."set_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exercises_fk" FOREIGN KEY ("exercises_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "clients_sessions_order_idx" ON "clients_sessions" USING btree ("_order");
  CREATE INDEX "clients_sessions_parent_id_idx" ON "clients_sessions" USING btree ("_parent_id");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE UNIQUE INDEX "clients_email_idx" ON "clients" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "plans_client_idx" ON "plans" USING btree ("client_id");
  CREATE INDEX "plans_updated_at_idx" ON "plans" USING btree ("updated_at");
  CREATE INDEX "plans_created_at_idx" ON "plans" USING btree ("created_at");
  CREATE INDEX "microcycles_plan_idx" ON "microcycles" USING btree ("plan_id");
  CREATE INDEX "microcycles_updated_at_idx" ON "microcycles" USING btree ("updated_at");
  CREATE INDEX "microcycles_created_at_idx" ON "microcycles" USING btree ("created_at");
  CREATE INDEX "workouts_sections_order_idx" ON "workouts_sections" USING btree ("_order");
  CREATE INDEX "workouts_sections_parent_id_idx" ON "workouts_sections" USING btree ("_parent_id");
  CREATE INDEX "workouts_microcycle_idx" ON "workouts" USING btree ("microcycle_id");
  CREATE INDEX "workouts_updated_at_idx" ON "workouts" USING btree ("updated_at");
  CREATE INDEX "workouts_created_at_idx" ON "workouts" USING btree ("created_at");
  CREATE INDEX "workout_groups_workout_idx" ON "workout_groups" USING btree ("workout_id");
  CREATE INDEX "workout_groups_updated_at_idx" ON "workout_groups" USING btree ("updated_at");
  CREATE INDEX "workout_groups_created_at_idx" ON "workout_groups" USING btree ("created_at");
  CREATE INDEX "workout_exercise_rows_set_parameters_order_idx" ON "workout_exercise_rows_set_parameters" USING btree ("_order");
  CREATE INDEX "workout_exercise_rows_set_parameters_parent_id_idx" ON "workout_exercise_rows_set_parameters" USING btree ("_parent_id");
  CREATE INDEX "workout_exercise_rows_group_idx" ON "workout_exercise_rows" USING btree ("group_id");
  CREATE INDEX "workout_exercise_rows_exercise_idx" ON "workout_exercise_rows" USING btree ("exercise_id");
  CREATE INDEX "workout_exercise_rows_updated_at_idx" ON "workout_exercise_rows" USING btree ("updated_at");
  CREATE INDEX "workout_exercise_rows_created_at_idx" ON "workout_exercise_rows" USING btree ("created_at");
  CREATE INDEX "workout_logs_workout_idx" ON "workout_logs" USING btree ("workout_id");
  CREATE INDEX "workout_logs_client_idx" ON "workout_logs" USING btree ("client_id");
  CREATE INDEX "workout_logs_updated_at_idx" ON "workout_logs" USING btree ("updated_at");
  CREATE INDEX "workout_logs_created_at_idx" ON "workout_logs" USING btree ("created_at");
  CREATE INDEX "round_logs_session_idx" ON "round_logs" USING btree ("session_id");
  CREATE INDEX "round_logs_group_idx" ON "round_logs" USING btree ("group_id");
  CREATE INDEX "round_logs_client_idx" ON "round_logs" USING btree ("client_id");
  CREATE INDEX "round_logs_updated_at_idx" ON "round_logs" USING btree ("updated_at");
  CREATE INDEX "round_logs_created_at_idx" ON "round_logs" USING btree ("created_at");
  CREATE INDEX "set_logs_session_idx" ON "set_logs" USING btree ("session_id");
  CREATE INDEX "set_logs_client_idx" ON "set_logs" USING btree ("client_id");
  CREATE INDEX "set_logs_exercise_idx" ON "set_logs" USING btree ("exercise_id");
  CREATE INDEX "set_logs_exercise_row_idx" ON "set_logs" USING btree ("exercise_row_id");
  CREATE INDEX "set_logs_round_log_idx" ON "set_logs" USING btree ("round_log_id");
  CREATE INDEX "set_logs_updated_at_idx" ON "set_logs" USING btree ("updated_at");
  CREATE INDEX "set_logs_created_at_idx" ON "set_logs" USING btree ("created_at");
  CREATE INDEX "exercises_updated_at_idx" ON "exercises" USING btree ("updated_at");
  CREATE INDEX "exercises_created_at_idx" ON "exercises" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("plans_id");
  CREATE INDEX "payload_locked_documents_rels_microcycles_id_idx" ON "payload_locked_documents_rels" USING btree ("microcycles_id");
  CREATE INDEX "payload_locked_documents_rels_workouts_id_idx" ON "payload_locked_documents_rels" USING btree ("workouts_id");
  CREATE INDEX "payload_locked_documents_rels_workout_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("workout_groups_id");
  CREATE INDEX "payload_locked_documents_rels_workout_exercise_rows_id_idx" ON "payload_locked_documents_rels" USING btree ("workout_exercise_rows_id");
  CREATE INDEX "payload_locked_documents_rels_workout_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("workout_logs_id");
  CREATE INDEX "payload_locked_documents_rels_round_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("round_logs_id");
  CREATE INDEX "payload_locked_documents_rels_set_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("set_logs_id");
  CREATE INDEX "payload_locked_documents_rels_exercises_id_idx" ON "payload_locked_documents_rels" USING btree ("exercises_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_clients_id_idx" ON "payload_preferences_rels" USING btree ("clients_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "clients_sessions" CASCADE;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "plans" CASCADE;
  DROP TABLE "microcycles" CASCADE;
  DROP TABLE "workouts_sections" CASCADE;
  DROP TABLE "workouts" CASCADE;
  DROP TABLE "workout_groups" CASCADE;
  DROP TABLE "workout_exercise_rows_set_parameters" CASCADE;
  DROP TABLE "workout_exercise_rows" CASCADE;
  DROP TABLE "workout_logs" CASCADE;
  DROP TABLE "round_logs" CASCADE;
  DROP TABLE "set_logs" CASCADE;
  DROP TABLE "exercises" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_plans_status";
  DROP TYPE "public"."enum_workout_groups_protocol";
  DROP TYPE "public"."enum_workout_exercise_rows_override_protocol";
  DROP TYPE "public"."enum_round_logs_status";
  DROP TYPE "public"."enum_exercises_tracking_type";`)
}
