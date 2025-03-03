CREATE TABLE IF NOT EXISTS "aiOutput" (
	"id" serial PRIMARY KEY NOT NULL,
	"formData" varchar,
	"aiResponse" text,
	"templateSlug" varchar,
	"createdBy" varchar,
	"createdAt" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userSubscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar,
	"userName" varchar,
	"active" boolean,
	"paymentId" varchar,
	"joinData" varchar
);
