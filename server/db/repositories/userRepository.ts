import { prisma } from "../client";

export const userRepository = {
  /**
   * Find a user by their username.
   *
   * @param username - The username to search for
   * @returns Promise resolving to the User object or null if not found
   */
  findByUsername: (username: string) => {
    return prisma.user.findUnique({ where: { username } });
  },

  /**
   * Find a user by their unique ID.
   *
   * @param id - The user ID to search for
   * @returns Promise resolving to the User object or null if not found
   */
  findById: (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  /**
   * Create a new user with the given username and hashed password.
   *
   * @param username - The username for the new user
   * @param hashedPassword - The bcrypt-hashed password
   * @returns Promise resolving to the created User object
   */
  create: (username: string, hashedPassword: string) => {
    return prisma.user.create({
      data: { username, password: hashedPassword },
    });
  },

  /**
   * Delete a user by their ID.
   *
   * @param id - The ID of the user to delete
   * @returns Promise resolving to the deleted User object
   */
  delete: (id: string) => {
    return prisma.user.delete({ where: { id } });
  },
};
