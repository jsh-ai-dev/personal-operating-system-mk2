import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "prisma/config";

const here = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(here, "..", "backend");

export default defineConfig({
  schema: join(here, "prisma", "schema.prisma"),
  /** 마이그레이션은 backend에서만 실행 */
  migrations: {
    path: join(backendRoot, "prisma", "migrations"),
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
