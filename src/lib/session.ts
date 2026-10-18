import "server-only";
import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

export const SESSION_COOKIE = "eag_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { uid: string; email: string; name: string };

// The signing key is generated on first use and stored in the database, so no
// SESSION_SECRET environment variable is needed.
let keyPromise: Promise<Uint8Array> | null = null;
function secretKey() {
  return (keyPromise ??= (async () => {
    const existing = await db.setting.findUnique({ where: { key: "sessionSecret" } });
    let secret = existing?.value;
    if (!secret) {
      secret = randomBytes(48).toString("base64url");
      await db.setting.upsert({ where: { key: "sessionSecret" }, create: { key: "sessionSecret", value: secret }, update: {} });
      secret = (await db.setting.findUniqueOrThrow({ where: { key: "sessionSecret" } })).value;
    }
    return new TextEncoder().encode(secret);
  })().catch((err) => {
    keyPromise = null;
    throw err;
  }));
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(await secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "string") return null;
    return { uid: payload.uid, email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}
