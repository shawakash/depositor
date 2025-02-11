import { Router } from "express";
import { userRouter } from "./user";
import { depositRouter } from "./depositor";
import { extractClientId } from "../../utils/middleware";

export const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/deposite", extractClientId, depositRouter);
