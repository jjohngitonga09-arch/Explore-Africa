import fs from "fs";

for (const f of ["package-lock.json", "yarn.lock"]) {
  if (fs.existsSync(f)) fs.rmSync(f);
}

const agent = process.env.npm_config_user_agent || "";
if (!agent.startsWith("pnpm/")) {
  console.error("Use pnpm instead of npm/yarn to install dependencies.");
  process.exit(1);
}
