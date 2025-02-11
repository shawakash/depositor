import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import logger from "../utils/logger";

export enum ValidateWhere {
  BODY,
  QUERY,
}

// todo: fix the error
export const validateRequest = (
  schema: AnyZodObject,
  wheres: ValidateWhere[] = [ValidateWhere.BODY],
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      wheres.forEach(async (where) => {
        switch (where) {
          case ValidateWhere.BODY:
            await schema.parseAsync(req.body);
          case ValidateWhere.QUERY:
            await schema.parseAsync(req.query);
        }
      });
      next();
    } catch (error) {
      logger.warn("Request validation failed", {
        path: req.path,
        body: req.body,
        error,
      });
      return res.status(400).json({
        message: "Invalid request data",
        error: error,
      });
    }
  };
};
