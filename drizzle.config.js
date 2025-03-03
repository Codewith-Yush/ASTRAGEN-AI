import 'dotenv/config';  // dotenv ko import kar raha hai

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",  // Agar schema.tsx hai toh .tsx likh
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL,  // Direct URL hata diya, ab .env se lega
    }
};
