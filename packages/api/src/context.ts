import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { prisma } from "./lib/prisma";
import { verifyToken } from "./lib/auth";

export async function createContext({ req }: CreateExpressContextOptions) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  let user = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch {
      // Invalid token — proceed as unauthenticated
    }
  }

  return { prisma, user, req };
}

export type Context = inferAsyncReturnType<typeof createContext>;
