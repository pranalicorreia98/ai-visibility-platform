/**
 * Self-contained local Postgres for development on machines without Docker
 * or a system Postgres install (e.g. this Windows box). Downloads a portable
 * Postgres binary on first run and stores data under prisma/.pgdata — no
 * admin rights, no Windows service, nothing installed system-wide.
 *
 * Usage:
 *   npx tsx scripts/dev-db.ts start   # starts (and initializes on first run)
 *   npx tsx scripts/dev-db.ts stop
 */
import EmbeddedPostgres from "embedded-postgres";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "prisma", ".pgdata");
const PORT = 55432;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "zeeklabs";

export function getDevDatabaseUrl(): string {
  return `postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}`;
}

async function main() {
  const command = process.argv[2] || "start";

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
  });

  if (command === "stop") {
    await pg.stop();
    console.log("Local dev Postgres stopped");
    return;
  }

  const fs = await import("fs");
  const isFirstRun = !fs.existsSync(path.join(DATA_DIR, "PG_VERSION"));

  if (isFirstRun) {
    console.log(`Initializing local Postgres in ${DATA_DIR} (first run, downloads binaries)...`);
    await pg.initialise();
  }

  await pg.start();
  console.log(`Local dev Postgres running on port ${PORT}`);

  if (isFirstRun) {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}"`);
  }

  console.log(`DATABASE_URL=${getDevDatabaseUrl()}`);
}

main().catch((error) => {
  console.error("dev-db failed:", error);
  process.exitCode = 1;
});
