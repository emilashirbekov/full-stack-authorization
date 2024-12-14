import prisma from "../prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendActivationMail } from "./mail-service";
import { tokenService } from "./token-service";

class UserService {
  async register(email: string, username: string, password: string) {
    // Проверка существующего пользователя
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      throw new Error(
        existingUser.email === email
          ? "Email already in use"
          : "Username already in use"
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерация ссылки активации
    const activationLink = uuidv4();

    // Создание пользователя
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword, activationLink },
    });

    // Отправка активационного письма
    await sendActivationMail(email, activationLink);

    // Генерация токенов
    const userPayload = { id: user.id, email: user.email, isActivated: false };
    const tokens = tokenService.generateToken(userPayload);

    // Сохранение refreshToken
    await tokenService.saveToken(user.id, tokens.refreshToken);

    return { user, tokens, userPayload };
  }
}

export const userService = new UserService();
