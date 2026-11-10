-- Phase 3 Schema Modernization Migration
ALTER TABLE "aiOutput" ALTER COLUMN "formData" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "aiOutput" ADD COLUMN IF NOT EXISTS "wordCount" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_output_created_by" ON "aiOutput" ("createdBy");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_output_created_by_at" ON "aiOutput" ("createdBy", "createdAt");--> statement-breakpoint

ALTER TABLE "userSubscription" ADD COLUMN IF NOT EXISTS "razorpaySubscriptionId" varchar(255);--> statement-breakpoint
ALTER TABLE "userSubscription" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE "userSubscription" ADD COLUMN IF NOT EXISTS "currentPeriodEnd" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_subscription_email" ON "userSubscription" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_subscription_rzp_sub" ON "userSubscription" ("razorpaySubscriptionId");--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "webhookEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventId" varchar(255) NOT NULL,
	"eventType" varchar(100) NOT NULL,
	"processedAt" timestamp DEFAULT now(),
	CONSTRAINT "webhookEvents_eventId_unique" UNIQUE("eventId")
);

