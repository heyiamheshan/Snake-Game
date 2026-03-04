import { defineConfig } from "prisma/config";

const isTest = process.env.NODE_ENV === "test";

export default defineConfig({
    schema: isTest
        ? "prisma/schema.sqlite.prisma"
        : "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    // datasource.url is intentionally omitted here —
    // Prisma reads DATABASE_URL from the environment automatically.
    // Declaring it here would require DATABASE_URL at `prisma generate` time
    // (which is unavailable during Docker builds).
});
