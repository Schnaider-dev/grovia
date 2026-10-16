import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function findRootEnv(): string | null {
    let dir = path.dirname(fileURLToPath(import.meta.url));

    for (let depth = 0; depth < 6; depth += 1) {
        const candidate = path.join(dir, ".env");
        const isRoot = fs.existsSync(path.join(dir, "pnpm-workspace.yaml"));

        if (isRoot && fs.existsSync(candidate)) return candidate;

        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    } 
    return null;
}

const envPath = findRootEnv();
if (envPath) {
    dotenv.config({path: envPath, quiet: true})
}
else {
    dotenv.config({ quiet: true });
}

    // Variables the API cannot start without.
const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

const missing = REQUIRED.filter(key => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV !== "test") {
    throw new Error(`
        Missing required environment variable(s) ${missing.join
            (",")}. Copy _.env.example to .env at the repo root and fill them in.`);
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "developmnt",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",

    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "30d",

    clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
    adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001"
} as const;

export default env;