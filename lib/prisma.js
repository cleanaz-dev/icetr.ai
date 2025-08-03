import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient({

  errorFormat: "pretty", // Reduces error verbosity
});

export default prisma;
