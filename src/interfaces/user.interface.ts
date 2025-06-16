import { User as PrismaUser } from "@prisma/client";

// Extender el tipo de Prisma
export interface User extends PrismaUser {}