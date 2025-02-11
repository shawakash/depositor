import { Router, Request, Response } from "express";
import { logger, userSignupBody } from "@repo/common";
import { db } from "../../db";
import { validateRequest } from "../../utils/validate";
import { setJWTCookie } from "../../utils/jwt";

export const userRouter = Router();

userRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, name } = userSignupBody.parse(req.body);

    const user = await db.user.create({
      data: {
        email,
        name,
      },
    });

    let jwt: string = "";
    if (user.id) {
      jwt = await setJWTCookie(req, res, user.id);
    }

    return res.status(200).json({
      message: "User created successfully",
      id: user.id,
      jwt,
    });
  } catch (error) {
    logger.error("Internal Error in signup: ", error);
    return res
      .status(500)
      .json({ message: "Internal Error in signup", error: error });
  }
});
