import { Request, Response } from "express";
import { userService } from "../services/user-service";

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const { user, tokens, userPayload } = await userService.register(
      email,
      username,
      password
    );
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActivated: userPayload.isActivated,
      },
      tokens,
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Registration error",
    });
  }
};

export { register };
