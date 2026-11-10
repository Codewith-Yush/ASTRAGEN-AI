import { boolean, pgTable, serial, text, varchar, timestamp, integer, index } from "drizzle-orm/pg-core";

export const AIOutput = pgTable("aiOutput", {
    id: serial("id").primaryKey(),
    formData: text("formData"),  // Stored as full text or stringified JSON
    aiResponse: text("aiResponse"),
    templateSlug: varchar("templateSlug", { length: 255 }),
    createdBy: varchar("createdBy", { length: 255 }).notNull(),
    wordCount: integer("wordCount").default(0),
    createdAt: timestamp("createdAt").defaultNow(),
}, (table) => {
    return {
        createdByIndex: index("idx_ai_output_created_by").on(table.createdBy),
        createdByCreatedAtIndex: index("idx_ai_output_created_by_at").on(table.createdBy, table.createdAt),
    };
});

export const UserSubscription = pgTable("userSubscription", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    userName: varchar("userName", { length: 255 }),
    active: boolean("active").default(false),
    paymentId: varchar("paymentId", { length: 255 }),
    razorpaySubscriptionId: varchar("razorpaySubscriptionId", { length: 255 }),
    status: varchar("status", { length: 50 }).default("inactive"),
    currentPeriodEnd: timestamp("currentPeriodEnd"),
    joinDate: timestamp("joinDate").defaultNow(),
}, (table) => {
    return {
        emailIndex: index("idx_user_subscription_email").on(table.email),
        subIdIndex: index("idx_user_subscription_rzp_sub").on(table.razorpaySubscriptionId),
    };
});

export const WebhookEvents = pgTable("webhookEvents", {
    id: serial("id").primaryKey(),
    eventId: varchar("eventId", { length: 255 }).notNull().unique(),
    eventType: varchar("eventType", { length: 100 }).notNull(),
    processedAt: timestamp("processedAt").defaultNow(),
});
