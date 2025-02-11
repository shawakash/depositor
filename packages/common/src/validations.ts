import { z } from "zod";
import { Network } from "./enum";

export const userSignupBody = z.object({
  name: z.string().min(3).max(255),
  email: z.string(),
});

export const getAddressQuery = z.object({
  network: z.nativeEnum(Network),
  coin: z.string(),
});

export const getNetworkForCoinQuery = z.object({
  coin: z.string(),
});
