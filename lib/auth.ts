import { cookies } from "next/headers";
import { prisma } from "./prisma";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: "SUPER_ADMIN" | "PENGAWAS" | "TUKANG";
}

const COOKIE_NAME = "smkmuh2_session";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const raw = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const data = JSON.parse(raw);
    if (!data.id || !data.role) return null;

    if (data.role === "TUKANG") {
      // Cek apakah ada di tabel worker
      const worker = await prisma.worker.findUnique({
        where: { id: data.id },
        select: { id: true, name: true, workerCode: true, status: true },
      });
      if (worker && worker.status === "ACTIVE") {
        return {
          id: worker.id,
          name: worker.name,
          username: worker.workerCode,
          role: "TUKANG",
        };
      }
    }

    // Cek di tabel user
    const user = await prisma.user.findUnique({
      where: { id: data.id },
      select: { id: true, name: true, username: true, role: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role as "SUPER_ADMIN" | "PENGAWAS" | "TUKANG",
    };
  } catch (e) {
    return null;
  }
}

export function createSessionCookie(user: { id: string; name: string; username: string; role: string }) {
  const payload = JSON.stringify({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: Date.now(),
  });
  return Buffer.from(payload).toString("base64");
}

export { COOKIE_NAME };
