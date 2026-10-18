import os from "node:os";
import path from "node:path";

/**
 * Everything the client adds (database, photos) lives in one data folder that is
 * deliberately OUTSIDE the app folder, so uploading a new version of the site
 * never deletes inventory or leads. No environment variables needed:
 *   production  -> ~/empire-auto-group-data   (e.g. /home/u123456789/empire-auto-group-data)
 *   development -> ./data
 * EMPIRE_DATA_DIR can override it, but nothing requires it.
 */
export const DATA_DIR = path.resolve(
  process.env.EMPIRE_DATA_DIR ||
    (process.env.NODE_ENV === "production" ? path.join(os.homedir(), "empire-auto-group-data") : path.join(process.cwd(), "data")),
);

export const DB_FILE = path.join(DATA_DIR, "empire.db");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
