ALTER TABLE "userSubscription" RENAME COLUMN "joinData" TO "joinDate";--> statement-breakpoint
ALTER TABLE "aiOutput" ALTER COLUMN "formData" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "aiOutput" ALTER COLUMN "templateSlug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "aiOutput" ALTER COLUMN "createdBy" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "aiOutput" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "aiOutput" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "userName" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "active" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "paymentId" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "joinDate" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "userSubscription" ALTER COLUMN "joinDate" SET DEFAULT now();