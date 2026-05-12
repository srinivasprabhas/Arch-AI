import { PrismaClient } from "@/app/generated/prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? ""

  if (url.startsWith("prisma+postgres://")) {
    // accelerateUrl is injected by the extension and not in the base constructor types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ accelerateUrl: url } as any).$extends(
      withAccelerate()
    ) as unknown as PrismaClient
  }

  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
