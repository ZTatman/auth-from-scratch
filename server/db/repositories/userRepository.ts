import { prisma } from "../client";

export const userRepository = {
  findByUsername: (username: string) => {
    return prisma.user.findUnique({ where: { username } });
  },

  create: (username: string, hashedPassword: string) => {
    return prisma.user.create({
      data: { username, password: hashedPassword },
    });
  },

  delete: (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
