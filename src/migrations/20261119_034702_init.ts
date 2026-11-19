import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_countries_exhibition_state" AS ENUM('Open Exhibition', 'Coming Soon', 'In Preparation', 'Temporarily Unavailable', 'Hidden / Not Public');
  CREATE TYPE "public"."enum_collections_status" AS ENUM('Draft', 'In Review', 'Approved', 'Published');
  CREATE TYPE "public"."enum_stories_status" AS ENUM('Draft', 'In Review', 'Approved', 'Published');
  CREATE TYPE "public"."enum_sources_source_type" AS ENUM('Primary', 'Secondary', 'Tertiary');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('New', 'In Progress', 'Resolved');
  CREATE TYPE "public"."enum_artifacts_artifact_type" AS ENUM('Stamp', 'First Day Cover', 'Coin', 'Document', 'Letter', 'Souvenir', 'Heritage Object', 'Artifact');
  CREATE TYPE "public"."enum_artifacts_claim_review_state" AS ENUM('Unreviewed', 'In Review', 'Approved', 'Disputed');
  CREATE TYPE "public"."enum_artifacts_editorial_state" AS ENUM('Draft', 'In Review', 'Approved', 'Published');
  CREATE TYPE "public"."enum_artifacts_translation_state" AS ENUM('Not Started', 'In Progress', 'Reviewed', 'Approved', 'Published');
  CREATE TYPE "public"."enum_artifacts_publication_state" AS ENUM('Unpublished', 'Published', 'Scheduled', 'Withdrawn');
  CREATE TYPE "public"."enum_publication_records_locale" AS ENUM('en', 'ar');
  CREATE TYPE "public"."enum_publication_records_state" AS ENUM('Draft', 'In Review', 'Published', 'Unpublished', 'Scheduled');
  CREATE TYPE "public"."enum_ownership_statements_state" AS ENUM('Draft', 'In Review', 'Approved', 'Rejected');
  CREATE TYPE "public"."enum_authenticity_assessments_state" AS ENUM('Draft', 'In Review', 'Approved', 'Rejected');
  CREATE TYPE "public"."enum_condition_reports_state" AS ENUM('Draft', 'In Review', 'Approved');
  CREATE TYPE "public"."enum_artifact_country_relationships_relationship_type" AS ENUM('Issued In', 'Produced In', 'Originated In', 'Found In', 'Associated With', 'Used In');
  CREATE TYPE "public"."enum_media_assets_alt_text_status" AS ENUM('Not Recorded', 'Draft', 'Reviewed', 'Approved');
  CREATE TYPE "public"."enum_media_assets_readiness_state" AS ENUM('Not Started', 'In Progress', 'Implemented', 'Verified', 'Deferred', 'Not Applicable');
  CREATE TYPE "public"."enum_rights_records_rights_status" AS ENUM('Unknown', 'Pending Review', 'Cleared', 'Restricted', 'Denied');
  CREATE TYPE "public"."enum_artifact_claims_claim_type" AS ENUM('Identity', 'Date', 'Origin', 'Provenance', 'Material', 'Other');
  CREATE TYPE "public"."enum_artifact_claims_review_state" AS ENUM('Unreviewed', 'In Review', 'Approved', 'Disputed', 'Rejected');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'system_administrator', 'museum_director', 'curator', 'editor', 'publisher', 'translator', 'media_manager', 'researcher', 'public_visitor', 'ai_service_principal');
  CREATE TYPE "public"."enum_verification_reviews_result" AS ENUM('Pass', 'Fail', 'Blocked', 'Not Run');
  CREATE TABLE "countries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"exhibition_state" "enum_countries_exhibition_state" DEFAULT 'In Preparation' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "countries_locales" (
  	"name" varchar NOT NULL,
  	"native_name" varchar,
  	"short_introduction" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "eras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"start_year" numeric,
  	"end_year" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "eras_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_collections_status" DEFAULT 'Draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "collections_locales" (
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "collections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"countries_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_stories_status" DEFAULT 'Draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stories_locales" (
  	"title" varchar NOT NULL,
  	"introduction" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"countries_id" integer,
  	"collections_id" integer
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"source_type" "enum_sources_source_type",
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sources_locales" (
  	"title" varchar NOT NULL,
  	"citation" varchar,
  	"notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"locale" varchar,
  	"status" "enum_inquiries_status" DEFAULT 'New',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artifacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"artifact_type" "enum_artifacts_artifact_type",
  	"claim_review_state" "enum_artifacts_claim_review_state" DEFAULT 'Unreviewed',
  	"editorial_state" "enum_artifacts_editorial_state" DEFAULT 'Draft',
  	"translation_state" "enum_artifacts_translation_state" DEFAULT 'Not Started',
  	"publication_state" "enum_artifacts_publication_state" DEFAULT 'Unpublished',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artifacts_locales" (
  	"title" varchar NOT NULL,
  	"short_description" varchar,
  	"long_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "artifacts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"collections_id" integer,
  	"countries_id" integer,
  	"eras_id" integer,
  	"stories_id" integer
  );
  
  CREATE TABLE "publication_records" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"locale" "enum_publication_records_locale" NOT NULL,
  	"state" "enum_publication_records_state" DEFAULT 'Draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"scheduled_at" timestamp(3) with time zone,
  	"publisher" varchar,
  	"route_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ownership_statements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artifact_id" integer NOT NULL,
  	"evidence_source_id" integer,
  	"reviewer" varchar,
  	"approved_at" timestamp(3) with time zone,
  	"state" "enum_ownership_statements_state" DEFAULT 'Draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ownership_statements_locales" (
  	"statement" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "authenticity_assessments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artifact_id" integer NOT NULL,
  	"method" varchar,
  	"evidence_source_id" integer,
  	"reviewer" varchar,
  	"approved_at" timestamp(3) with time zone,
  	"state" "enum_authenticity_assessments_state" DEFAULT 'Draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authenticity_assessments_locales" (
  	"assessment" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "condition_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artifact_id" integer NOT NULL,
  	"assessor" varchar,
  	"assessed_at" timestamp(3) with time zone,
  	"state" "enum_condition_reports_state" DEFAULT 'Draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "condition_reports_locales" (
  	"description" varchar NOT NULL,
  	"preservation_observations" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "artifact_country_relationships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artifact_id" integer NOT NULL,
  	"country_id" integer NOT NULL,
  	"relationship_type" "enum_artifact_country_relationships_relationship_type" NOT NULL,
  	"is_primary_display" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"filename" varchar NOT NULL,
  	"asset_id" varchar NOT NULL,
  	"mime_type" varchar,
  	"width" numeric,
  	"height" numeric,
  	"sha256" varchar,
  	"alt_text_status" "enum_media_assets_alt_text_status" DEFAULT 'Not Recorded',
  	"readiness_state" "enum_media_assets_readiness_state" DEFAULT 'Not Started',
  	"artifact_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_assets_locales" (
  	"alt_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_assets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"rights_records_id" integer
  );
  
  CREATE TABLE "rights_records" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"licence" varchar,
  	"licensor" varchar,
  	"territory" varchar,
  	"term" varchar,
  	"expiry" timestamp(3) with time zone,
  	"rights_status" "enum_rights_records_rights_status" DEFAULT 'Unknown',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rights_records_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rights_records_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_assets_id" integer
  );
  
  CREATE TABLE "artifact_claims" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artifact_id" integer NOT NULL,
  	"claim_type" "enum_artifact_claims_claim_type",
  	"review_state" "enum_artifact_claims_review_state" DEFAULT 'Unreviewed',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artifact_claims_locales" (
  	"claim" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "artifact_claims_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "verification_reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"reviewer_id" integer,
  	"result" "enum_verification_reviews_result",
  	"reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "verification_reviews_locales" (
  	"notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "provenance_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artifact_id" integer NOT NULL,
  	"event_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "provenance_events_locales" (
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "provenance_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "audit_event" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar NOT NULL,
  	"action" varchar NOT NULL,
  	"actor" varchar,
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"payload" jsonb,
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
  	"countries_id" integer,
  	"eras_id" integer,
  	"categories_id" integer,
  	"collections_id" integer,
  	"stories_id" integer,
  	"sources_id" integer,
  	"inquiries_id" integer,
  	"artifacts_id" integer,
  	"publication_records_id" integer,
  	"ownership_statements_id" integer,
  	"authenticity_assessments_id" integer,
  	"condition_reports_id" integer,
  	"artifact_country_relationships_id" integer,
  	"media_assets_id" integer,
  	"rights_records_id" integer,
  	"artifact_claims_id" integer,
  	"users_id" integer,
  	"verification_reviews_id" integer,
  	"provenance_events_id" integer,
  	"pages_id" integer,
  	"audit_event_id" integer
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
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "countries_locales" ADD CONSTRAINT "countries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eras_locales" ADD CONSTRAINT "eras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_locales" ADD CONSTRAINT "collections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_locales" ADD CONSTRAINT "stories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stories_rels" ADD CONSTRAINT "stories_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_locales" ADD CONSTRAINT "sources_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_locales" ADD CONSTRAINT "artifacts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_rels" ADD CONSTRAINT "artifacts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_rels" ADD CONSTRAINT "artifacts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_rels" ADD CONSTRAINT "artifacts_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_rels" ADD CONSTRAINT "artifacts_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_rels" ADD CONSTRAINT "artifacts_rels_eras_fk" FOREIGN KEY ("eras_id") REFERENCES "public"."eras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifacts_rels" ADD CONSTRAINT "artifacts_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ownership_statements" ADD CONSTRAINT "ownership_statements_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ownership_statements" ADD CONSTRAINT "ownership_statements_evidence_source_id_sources_id_fk" FOREIGN KEY ("evidence_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ownership_statements_locales" ADD CONSTRAINT "ownership_statements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ownership_statements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authenticity_assessments" ADD CONSTRAINT "authenticity_assessments_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authenticity_assessments" ADD CONSTRAINT "authenticity_assessments_evidence_source_id_sources_id_fk" FOREIGN KEY ("evidence_source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authenticity_assessments_locales" ADD CONSTRAINT "authenticity_assessments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authenticity_assessments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "condition_reports" ADD CONSTRAINT "condition_reports_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "condition_reports_locales" ADD CONSTRAINT "condition_reports_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."condition_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifact_country_relationships" ADD CONSTRAINT "artifact_country_relationships_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artifact_country_relationships" ADD CONSTRAINT "artifact_country_relationships_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_assets_locales" ADD CONSTRAINT "media_assets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_assets_rels" ADD CONSTRAINT "media_assets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_assets_rels" ADD CONSTRAINT "media_assets_rels_rights_records_fk" FOREIGN KEY ("rights_records_id") REFERENCES "public"."rights_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rights_records_locales" ADD CONSTRAINT "rights_records_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rights_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rights_records_rels" ADD CONSTRAINT "rights_records_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rights_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rights_records_rels" ADD CONSTRAINT "rights_records_rels_media_assets_fk" FOREIGN KEY ("media_assets_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifact_claims" ADD CONSTRAINT "artifact_claims_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artifact_claims_locales" ADD CONSTRAINT "artifact_claims_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artifact_claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifact_claims_rels" ADD CONSTRAINT "artifact_claims_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."artifact_claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artifact_claims_rels" ADD CONSTRAINT "artifact_claims_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "verification_reviews" ADD CONSTRAINT "verification_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "verification_reviews_locales" ADD CONSTRAINT "verification_reviews_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."verification_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "provenance_events" ADD CONSTRAINT "provenance_events_artifact_id_artifacts_id_fk" FOREIGN KEY ("artifact_id") REFERENCES "public"."artifacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "provenance_events_locales" ADD CONSTRAINT "provenance_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."provenance_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "provenance_events_rels" ADD CONSTRAINT "provenance_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."provenance_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "provenance_events_rels" ADD CONSTRAINT "provenance_events_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_countries_fk" FOREIGN KEY ("countries_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_eras_fk" FOREIGN KEY ("eras_id") REFERENCES "public"."eras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stories_fk" FOREIGN KEY ("stories_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artifacts_fk" FOREIGN KEY ("artifacts_id") REFERENCES "public"."artifacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publication_records_fk" FOREIGN KEY ("publication_records_id") REFERENCES "public"."publication_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ownership_statements_fk" FOREIGN KEY ("ownership_statements_id") REFERENCES "public"."ownership_statements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authenticity_assessments_fk" FOREIGN KEY ("authenticity_assessments_id") REFERENCES "public"."authenticity_assessments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_condition_reports_fk" FOREIGN KEY ("condition_reports_id") REFERENCES "public"."condition_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artifact_country_relationsh_fk" FOREIGN KEY ("artifact_country_relationships_id") REFERENCES "public"."artifact_country_relationships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_assets_fk" FOREIGN KEY ("media_assets_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rights_records_fk" FOREIGN KEY ("rights_records_id") REFERENCES "public"."rights_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artifact_claims_fk" FOREIGN KEY ("artifact_claims_id") REFERENCES "public"."artifact_claims"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_reviews_fk" FOREIGN KEY ("verification_reviews_id") REFERENCES "public"."verification_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_provenance_events_fk" FOREIGN KEY ("provenance_events_id") REFERENCES "public"."provenance_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_event_fk" FOREIGN KEY ("audit_event_id") REFERENCES "public"."audit_event"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "countries_slug_idx" ON "countries" USING btree ("slug");
  CREATE INDEX "countries_updated_at_idx" ON "countries" USING btree ("updated_at");
  CREATE INDEX "countries_created_at_idx" ON "countries" USING btree ("created_at");
  CREATE UNIQUE INDEX "countries_locales_locale_parent_id_unique" ON "countries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "countries_locales_parent_id_idx" ON "countries_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "eras_slug_idx" ON "eras" USING btree ("slug");
  CREATE INDEX "eras_updated_at_idx" ON "eras" USING btree ("updated_at");
  CREATE INDEX "eras_created_at_idx" ON "eras" USING btree ("created_at");
  CREATE UNIQUE INDEX "eras_locales_locale_parent_id_unique" ON "eras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "eras_locales_parent_id_idx" ON "eras_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_locales_parent_id_idx" ON "categories_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");
  CREATE INDEX "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");
  CREATE UNIQUE INDEX "collections_locales_locale_parent_id_unique" ON "collections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "collections_locales_parent_id_idx" ON "collections_locales" USING btree ("_parent_id");
  CREATE INDEX "collections_rels_order_idx" ON "collections_rels" USING btree ("order");
  CREATE INDEX "collections_rels_parent_idx" ON "collections_rels" USING btree ("parent_id");
  CREATE INDEX "collections_rels_path_idx" ON "collections_rels" USING btree ("path");
  CREATE INDEX "collections_rels_countries_id_idx" ON "collections_rels" USING btree ("countries_id");
  CREATE INDEX "collections_rels_categories_id_idx" ON "collections_rels" USING btree ("categories_id");
  CREATE UNIQUE INDEX "stories_slug_idx" ON "stories" USING btree ("slug");
  CREATE INDEX "stories_updated_at_idx" ON "stories" USING btree ("updated_at");
  CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");
  CREATE UNIQUE INDEX "stories_locales_locale_parent_id_unique" ON "stories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "stories_locales_parent_id_idx" ON "stories_locales" USING btree ("_parent_id");
  CREATE INDEX "stories_rels_order_idx" ON "stories_rels" USING btree ("order");
  CREATE INDEX "stories_rels_parent_idx" ON "stories_rels" USING btree ("parent_id");
  CREATE INDEX "stories_rels_path_idx" ON "stories_rels" USING btree ("path");
  CREATE INDEX "stories_rels_countries_id_idx" ON "stories_rels" USING btree ("countries_id");
  CREATE INDEX "stories_rels_collections_id_idx" ON "stories_rels" USING btree ("collections_id");
  CREATE UNIQUE INDEX "sources_slug_idx" ON "sources" USING btree ("slug");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE UNIQUE INDEX "sources_locales_locale_parent_id_unique" ON "sources_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sources_locales_parent_id_idx" ON "sources_locales" USING btree ("_parent_id");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "artifacts_slug_idx" ON "artifacts" USING btree ("slug");
  CREATE INDEX "artifacts_updated_at_idx" ON "artifacts" USING btree ("updated_at");
  CREATE INDEX "artifacts_created_at_idx" ON "artifacts" USING btree ("created_at");
  CREATE UNIQUE INDEX "artifacts_locales_locale_parent_id_unique" ON "artifacts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "artifacts_locales_parent_id_idx" ON "artifacts_locales" USING btree ("_parent_id");
  CREATE INDEX "artifacts_rels_order_idx" ON "artifacts_rels" USING btree ("order");
  CREATE INDEX "artifacts_rels_parent_idx" ON "artifacts_rels" USING btree ("parent_id");
  CREATE INDEX "artifacts_rels_path_idx" ON "artifacts_rels" USING btree ("path");
  CREATE INDEX "artifacts_rels_categories_id_idx" ON "artifacts_rels" USING btree ("categories_id");
  CREATE INDEX "artifacts_rels_collections_id_idx" ON "artifacts_rels" USING btree ("collections_id");
  CREATE INDEX "artifacts_rels_countries_id_idx" ON "artifacts_rels" USING btree ("countries_id");
  CREATE INDEX "artifacts_rels_eras_id_idx" ON "artifacts_rels" USING btree ("eras_id");
  CREATE INDEX "artifacts_rels_stories_id_idx" ON "artifacts_rels" USING btree ("stories_id");
  CREATE INDEX "publication_records_entity_type_idx" ON "publication_records" USING btree ("entity_type");
  CREATE INDEX "publication_records_entity_id_idx" ON "publication_records" USING btree ("entity_id");
  CREATE INDEX "publication_records_updated_at_idx" ON "publication_records" USING btree ("updated_at");
  CREATE INDEX "publication_records_created_at_idx" ON "publication_records" USING btree ("created_at");
  CREATE INDEX "ownership_statements_artifact_idx" ON "ownership_statements" USING btree ("artifact_id");
  CREATE INDEX "ownership_statements_evidence_source_idx" ON "ownership_statements" USING btree ("evidence_source_id");
  CREATE INDEX "ownership_statements_updated_at_idx" ON "ownership_statements" USING btree ("updated_at");
  CREATE INDEX "ownership_statements_created_at_idx" ON "ownership_statements" USING btree ("created_at");
  CREATE UNIQUE INDEX "ownership_statements_locales_locale_parent_id_unique" ON "ownership_statements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ownership_statements_locales_parent_id_idx" ON "ownership_statements_locales" USING btree ("_parent_id");
  CREATE INDEX "authenticity_assessments_artifact_idx" ON "authenticity_assessments" USING btree ("artifact_id");
  CREATE INDEX "authenticity_assessments_evidence_source_idx" ON "authenticity_assessments" USING btree ("evidence_source_id");
  CREATE INDEX "authenticity_assessments_updated_at_idx" ON "authenticity_assessments" USING btree ("updated_at");
  CREATE INDEX "authenticity_assessments_created_at_idx" ON "authenticity_assessments" USING btree ("created_at");
  CREATE UNIQUE INDEX "authenticity_assessments_locales_locale_parent_id_unique" ON "authenticity_assessments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "authenticity_assessments_locales_parent_id_idx" ON "authenticity_assessments_locales" USING btree ("_parent_id");
  CREATE INDEX "condition_reports_artifact_idx" ON "condition_reports" USING btree ("artifact_id");
  CREATE INDEX "condition_reports_updated_at_idx" ON "condition_reports" USING btree ("updated_at");
  CREATE INDEX "condition_reports_created_at_idx" ON "condition_reports" USING btree ("created_at");
  CREATE UNIQUE INDEX "condition_reports_locales_locale_parent_id_unique" ON "condition_reports_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "condition_reports_locales_parent_id_idx" ON "condition_reports_locales" USING btree ("_parent_id");
  CREATE INDEX "artifact_country_relationships_artifact_idx" ON "artifact_country_relationships" USING btree ("artifact_id");
  CREATE INDEX "artifact_country_relationships_country_idx" ON "artifact_country_relationships" USING btree ("country_id");
  CREATE INDEX "artifact_country_relationships_updated_at_idx" ON "artifact_country_relationships" USING btree ("updated_at");
  CREATE INDEX "artifact_country_relationships_created_at_idx" ON "artifact_country_relationships" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_assets_asset_id_idx" ON "media_assets" USING btree ("asset_id");
  CREATE INDEX "media_assets_artifact_idx" ON "media_assets" USING btree ("artifact_id");
  CREATE INDEX "media_assets_updated_at_idx" ON "media_assets" USING btree ("updated_at");
  CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_assets_locales_locale_parent_id_unique" ON "media_assets_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_assets_locales_parent_id_idx" ON "media_assets_locales" USING btree ("_parent_id");
  CREATE INDEX "media_assets_rels_order_idx" ON "media_assets_rels" USING btree ("order");
  CREATE INDEX "media_assets_rels_parent_idx" ON "media_assets_rels" USING btree ("parent_id");
  CREATE INDEX "media_assets_rels_path_idx" ON "media_assets_rels" USING btree ("path");
  CREATE INDEX "media_assets_rels_rights_records_id_idx" ON "media_assets_rels" USING btree ("rights_records_id");
  CREATE INDEX "rights_records_updated_at_idx" ON "rights_records" USING btree ("updated_at");
  CREATE INDEX "rights_records_created_at_idx" ON "rights_records" USING btree ("created_at");
  CREATE UNIQUE INDEX "rights_records_locales_locale_parent_id_unique" ON "rights_records_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rights_records_locales_parent_id_idx" ON "rights_records_locales" USING btree ("_parent_id");
  CREATE INDEX "rights_records_rels_order_idx" ON "rights_records_rels" USING btree ("order");
  CREATE INDEX "rights_records_rels_parent_idx" ON "rights_records_rels" USING btree ("parent_id");
  CREATE INDEX "rights_records_rels_path_idx" ON "rights_records_rels" USING btree ("path");
  CREATE INDEX "rights_records_rels_media_assets_id_idx" ON "rights_records_rels" USING btree ("media_assets_id");
  CREATE INDEX "artifact_claims_artifact_idx" ON "artifact_claims" USING btree ("artifact_id");
  CREATE INDEX "artifact_claims_updated_at_idx" ON "artifact_claims" USING btree ("updated_at");
  CREATE INDEX "artifact_claims_created_at_idx" ON "artifact_claims" USING btree ("created_at");
  CREATE UNIQUE INDEX "artifact_claims_locales_locale_parent_id_unique" ON "artifact_claims_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "artifact_claims_locales_parent_id_idx" ON "artifact_claims_locales" USING btree ("_parent_id");
  CREATE INDEX "artifact_claims_rels_order_idx" ON "artifact_claims_rels" USING btree ("order");
  CREATE INDEX "artifact_claims_rels_parent_idx" ON "artifact_claims_rels" USING btree ("parent_id");
  CREATE INDEX "artifact_claims_rels_path_idx" ON "artifact_claims_rels" USING btree ("path");
  CREATE INDEX "artifact_claims_rels_sources_id_idx" ON "artifact_claims_rels" USING btree ("sources_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "verification_reviews_reviewer_idx" ON "verification_reviews" USING btree ("reviewer_id");
  CREATE INDEX "verification_reviews_updated_at_idx" ON "verification_reviews" USING btree ("updated_at");
  CREATE INDEX "verification_reviews_created_at_idx" ON "verification_reviews" USING btree ("created_at");
  CREATE UNIQUE INDEX "verification_reviews_locales_locale_parent_id_unique" ON "verification_reviews_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "verification_reviews_locales_parent_id_idx" ON "verification_reviews_locales" USING btree ("_parent_id");
  CREATE INDEX "provenance_events_artifact_idx" ON "provenance_events" USING btree ("artifact_id");
  CREATE INDEX "provenance_events_updated_at_idx" ON "provenance_events" USING btree ("updated_at");
  CREATE INDEX "provenance_events_created_at_idx" ON "provenance_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "provenance_events_locales_locale_parent_id_unique" ON "provenance_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "provenance_events_locales_parent_id_idx" ON "provenance_events_locales" USING btree ("_parent_id");
  CREATE INDEX "provenance_events_rels_order_idx" ON "provenance_events_rels" USING btree ("order");
  CREATE INDEX "provenance_events_rels_parent_idx" ON "provenance_events_rels" USING btree ("parent_id");
  CREATE INDEX "provenance_events_rels_path_idx" ON "provenance_events_rels" USING btree ("path");
  CREATE INDEX "provenance_events_rels_sources_id_idx" ON "provenance_events_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "audit_event_updated_at_idx" ON "audit_event" USING btree ("updated_at");
  CREATE INDEX "audit_event_created_at_idx" ON "audit_event" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_countries_id_idx" ON "payload_locked_documents_rels" USING btree ("countries_id");
  CREATE INDEX "payload_locked_documents_rels_eras_id_idx" ON "payload_locked_documents_rels" USING btree ("eras_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");
  CREATE INDEX "payload_locked_documents_rels_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("stories_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_artifacts_id_idx" ON "payload_locked_documents_rels" USING btree ("artifacts_id");
  CREATE INDEX "payload_locked_documents_rels_publication_records_id_idx" ON "payload_locked_documents_rels" USING btree ("publication_records_id");
  CREATE INDEX "payload_locked_documents_rels_ownership_statements_id_idx" ON "payload_locked_documents_rels" USING btree ("ownership_statements_id");
  CREATE INDEX "payload_locked_documents_rels_authenticity_assessments_i_idx" ON "payload_locked_documents_rels" USING btree ("authenticity_assessments_id");
  CREATE INDEX "payload_locked_documents_rels_condition_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("condition_reports_id");
  CREATE INDEX "payload_locked_documents_rels_artifact_country_relations_idx" ON "payload_locked_documents_rels" USING btree ("artifact_country_relationships_id");
  CREATE INDEX "payload_locked_documents_rels_media_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("media_assets_id");
  CREATE INDEX "payload_locked_documents_rels_rights_records_id_idx" ON "payload_locked_documents_rels" USING btree ("rights_records_id");
  CREATE INDEX "payload_locked_documents_rels_artifact_claims_id_idx" ON "payload_locked_documents_rels" USING btree ("artifact_claims_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_verification_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_reviews_id");
  CREATE INDEX "payload_locked_documents_rels_provenance_events_id_idx" ON "payload_locked_documents_rels" USING btree ("provenance_events_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_audit_event_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_event_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "countries" CASCADE;
  DROP TABLE "countries_locales" CASCADE;
  DROP TABLE "eras" CASCADE;
  DROP TABLE "eras_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "collections" CASCADE;
  DROP TABLE "collections_locales" CASCADE;
  DROP TABLE "collections_rels" CASCADE;
  DROP TABLE "stories" CASCADE;
  DROP TABLE "stories_locales" CASCADE;
  DROP TABLE "stories_rels" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "sources_locales" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "artifacts" CASCADE;
  DROP TABLE "artifacts_locales" CASCADE;
  DROP TABLE "artifacts_rels" CASCADE;
  DROP TABLE "publication_records" CASCADE;
  DROP TABLE "ownership_statements" CASCADE;
  DROP TABLE "ownership_statements_locales" CASCADE;
  DROP TABLE "authenticity_assessments" CASCADE;
  DROP TABLE "authenticity_assessments_locales" CASCADE;
  DROP TABLE "condition_reports" CASCADE;
  DROP TABLE "condition_reports_locales" CASCADE;
  DROP TABLE "artifact_country_relationships" CASCADE;
  DROP TABLE "media_assets" CASCADE;
  DROP TABLE "media_assets_locales" CASCADE;
  DROP TABLE "media_assets_rels" CASCADE;
  DROP TABLE "rights_records" CASCADE;
  DROP TABLE "rights_records_locales" CASCADE;
  DROP TABLE "rights_records_rels" CASCADE;
  DROP TABLE "artifact_claims" CASCADE;
  DROP TABLE "artifact_claims_locales" CASCADE;
  DROP TABLE "artifact_claims_rels" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "verification_reviews" CASCADE;
  DROP TABLE "verification_reviews_locales" CASCADE;
  DROP TABLE "provenance_events" CASCADE;
  DROP TABLE "provenance_events_locales" CASCADE;
  DROP TABLE "provenance_events_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "audit_event" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_countries_exhibition_state";
  DROP TYPE "public"."enum_collections_status";
  DROP TYPE "public"."enum_stories_status";
  DROP TYPE "public"."enum_sources_source_type";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_artifacts_artifact_type";
  DROP TYPE "public"."enum_artifacts_claim_review_state";
  DROP TYPE "public"."enum_artifacts_editorial_state";
  DROP TYPE "public"."enum_artifacts_translation_state";
  DROP TYPE "public"."enum_artifacts_publication_state";
  DROP TYPE "public"."enum_publication_records_locale";
  DROP TYPE "public"."enum_publication_records_state";
  DROP TYPE "public"."enum_ownership_statements_state";
  DROP TYPE "public"."enum_authenticity_assessments_state";
  DROP TYPE "public"."enum_condition_reports_state";
  DROP TYPE "public"."enum_artifact_country_relationships_relationship_type";
  DROP TYPE "public"."enum_media_assets_alt_text_status";
  DROP TYPE "public"."enum_media_assets_readiness_state";
  DROP TYPE "public"."enum_rights_records_rights_status";
  DROP TYPE "public"."enum_artifact_claims_claim_type";
  DROP TYPE "public"."enum_artifact_claims_review_state";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_verification_reviews_result";`);
}
