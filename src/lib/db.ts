// Nota: Esta aplicación usa datos en memoria (Zustand + localStorage)
// La conexión a Prisma está disponible pero no se usa activamente en la demo.
// En Vercel no se necesita base de datos para que funcione la demo.

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Solo crear el cliente si tenemos DATABASE_URL, sino usar null
export const db = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] }))
  : null

if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db as PrismaClient
}
