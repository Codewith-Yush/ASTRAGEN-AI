import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    }
};
