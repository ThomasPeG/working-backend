import { Employee as PrismaEmployee } from "@prisma/client";

// Extender el tipo de Prisma
export interface Employee extends PrismaEmployee {}
