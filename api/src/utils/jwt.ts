import { Request, Response } from "express";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import {
  AUTH_JWT_PRIVATE_KEY,
  AUTH_JWT_PUBLIC_KEY,
  PRIVATE_KEY_ENCRYPTION_KEY,
  JWT_ALGO,
} from "../config";

export const validateJwt = async (jwt: string) => {
  const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, JWT_ALGO);
  return await jwtVerify(jwt, publicKey, {
    issuer: "shawakash",
    audience: "depositor",
  });
};

export const clearCookie = (res: Response, cookieName: string) => {
  res.clearCookie(cookieName);
};

export const setJWTCookie = async (
  req: Request,
  res: Response,
  userId: string,
) => {
  const secret = await importPKCS8(AUTH_JWT_PRIVATE_KEY, JWT_ALGO);

  const jwt = await new SignJWT({
    sub: userId,
  })
    .setProtectedHeader({ alg: JWT_ALGO })
    .setIssuer("shawakash")
    .setAudience("depositor")
    .setIssuedAt()
    .sign(secret);

  setCookieOnResponse(req, res, "jwt", jwt);

  return jwt;
};

export const setCookieOnResponse = (
  req: Request,
  res: Response,
  cookieName: string,
  cookieValue: string,
) => {
  res.cookie(cookieName, cookieValue, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    // Note: the leading . below is significant, as it enables us to use the
    // cookie on subdomains
    domain: req.hostname.includes("localhost") ? "localhost" : ".depositor.dev",
    path: "/",
    maxAge: 60 * 60 * 24 * 10, // approx 10 days
  });
};
