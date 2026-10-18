import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { siteUrl } from "./site-url";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** True until the first admin account is created on the setup screen. */
export async function needsFirstAdmin() {
  return (await db.adminUser.count()) === 0;
}

export async function createSession(user: SessionPayload) {
  const token = await signSession(user);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: (await siteUrl()).startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/**
 * Use at the top of every admin page, route and server action: it verifies the
 * session cookie and confirms the user still exists.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = await db.adminUser.findUnique({ where: { id: session.uid }, select: { id: true, email: true, name: true } });
  if (!user) redirect("/admin/login");
  return user;
}
