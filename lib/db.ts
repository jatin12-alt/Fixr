import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Handle case where Prisma client isn't installed yet
let prismaInstance: PrismaClient

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query'],
  })
} catch (error) {
  console.warn('Prisma client not available. Please run: npm install @prisma/client && npm run db:prisma:generate')
  // Create a mock object to prevent runtime errors
  prismaInstance = {} as PrismaClient
}

export const db = prismaInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance
}
