import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

interface TokenPayload {
  id: number;
  email: string;
}

export const tokenService = {
  generateToken: (payload: TokenPayload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  },

  saveToken: async (userId: number, refreshToken: string) => {
    try {
      const tokenData = await prisma.token.findFirst({
        where: { userId: userId },
      });
      if (tokenData) {
        await prisma.token.update({
          where: {
            id: tokenData.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          data: { refreshToken },
        });
      } else {
        await prisma.token.create({
          data: {
            userId,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } catch (error) {
      console.error("Error saving token:", error);
      throw new Error("Could not save token");
    }
  },

  removeToken: async (refreshToken: string) => {
    try {
      await prisma.token.deleteMany({ where: { refreshToken } });
    } catch (error) {
      console.error("Error removing token:", error);
      throw new Error("Could not remove token");
    }
  },

  findToken: async (refreshToken: string) => {
    try {
      return await prisma.token.findFirst({ where: { refreshToken } });
    } catch (error) {
      console.error("Error finding token:", error);
      throw new Error("Could not find token");
    }
  },
};
