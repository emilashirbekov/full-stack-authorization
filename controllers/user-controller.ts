import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import uuid from "uuid";
import { sendActivationMail } from "../services/mail-service";

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  // Хеширование пароля
  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error hashing password", error: error.message });
  }

  try {
    // Проверяем, существует ли пользователь с таким email или username
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingEmail || existingUsername) {
      res.status(400).json({
        message: existingEmail
          ? "Email already in use"
          : "Username already in use",
      });
    }

    const activationLink = uuid.v4();

    // Создаем пользователя
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    // Возвращаем только нужную информацию
    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, username: user.username, email: user.email },
    });

    await sendActivationMail(email, activationLink);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

export default { register };
