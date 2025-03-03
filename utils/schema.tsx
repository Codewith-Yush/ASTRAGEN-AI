import { boolean, pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const AIOutput = pgTable("aiOutput", {
    id: serial("id").primaryKey(),
    formData: varchar("formData", { length: 255 }),  // length specify ki
    aiResponse: text("aiResponse"),
    templateSlug: varchar("templateSlug", { length: 255 }),
    createdBy: varchar("createdBy", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow(),  // Timestamp bana diya
});

export const UserSubscription = pgTable("userSubscription", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),  // Email required hona chahiye
    userName: varchar("userName", { length: 255 }),
    active: boolean("active").default(false),  // Default false diya
    paymentId: varchar("paymentId", { length: 255 }),
    joinDate: timestamp("joinDate").defaultNow(),  // Name fix kiya aur timestamp banaya
});
