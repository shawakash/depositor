import { Router, Request, Response } from "express";
import { extractClientId } from "../../utils/middleware";
import { getAddressQuery, getNetworkForCoinQuery, logger } from "@repo/common";
import { KeyPairGen } from "../../utils/keypair";
import { db } from "../../db";

export const depositRouter = Router();

depositRouter.get("/network", async (req: Request, res: Response) => {
  try {
    const { coin } = getNetworkForCoinQuery.parse(req.query);
    // todo: query the db to find out the available networks for the given coin
    return res.status(200).json({
      message: "Hang tight, we are working on it.",
      networks: ["network1", "network2"],
    });
  } catch (error) {
    logger.error("Internal Error in signup: ", error);
    return res
      .status(500)
      .json({ message: "Internal Error in signup", error: error });
  }
});

depositRouter.get("/address", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;

    const { network, coin } = getAddressQuery.parse(req.query);
    // check if the network is already available

    const wallet = await db.wallet.findFirst({
      where: {
        userId: id,
        network,
      },
    });

    if (wallet) {
      return res.status(200).json({
        message: "Address already present",
        address: wallet.address,
      });
    }

    const { pk, address } = KeyPairGen.getInstance().getKeyPair(id, network);

    // todo: use private key management logic to store the private key multi-sig
    await db.wallet.create({
      data: {
        userId: id,
        network,
        address,
        pk,
      },
    });

    return res.status(200).json({
      message: "Address generated successfully",
      address,
    });
  } catch (error) {
    logger.error("Internal Error in getting address: ", error);
    return res
      .status(500)
      .json({ message: "Internal Error in getting address", error: error });
  }
});
