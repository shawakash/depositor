import * as bip39 from "bip39";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import { Network } from "@repo/common";
import { derivePath } from "ed25519-hd-key";
import bs58 from "bs58";
import { DEPOSITOR_SEED } from "../config";
import logger from "./logger";
import { createHash } from "crypto";

// Todo: to deploy the account on the network
export class KeyPairGen {
  private seed: string;
  public static instance: KeyPairGen;
  private static MAX_INDEX = 214748364;

  private constructor() {
    if (!DEPOSITOR_SEED) {
      this.seed = this.generateSeed();
    } else {
      this.seed = DEPOSITOR_SEED;
    }
  }

  static getInstance() {
    if (!KeyPairGen.instance) {
      KeyPairGen.instance = new KeyPairGen();
    }
    return KeyPairGen.instance;
  }

  private generateSeed(): string {
    return bip39.generateMnemonic();
  }

  private getNumericIndex(id: string): number {
    const hash = createHash("sha256").update(id).digest();
    return Math.abs(hash.readUInt32BE(0) % KeyPairGen.MAX_INDEX);
  }

  getKeyPair(id: string, network: Network) {
    const index = this.getNumericIndex(id);

    switch (network) {
      case Network.ETHEREUM:
        return this.generateEthKeyPair(index);
      case Network.SOLANA:
        return this.generateSolanaKeyPair(index);
      default:
        throw new Error("Invalid network");
    }
  }

  private generateSolanaKeyPair(index: number) {
    const seedBuffer = bip39.mnemonicToSeedSync(this.seed);
    const derivedSeed = derivePath(
      `m/44'/501'/${index}'/0'`,
      seedBuffer.toString("hex"),
    ).key;
    const keypair = Keypair.fromSeed(derivedSeed);

    return {
      pk: bs58.encode(keypair.secretKey),
      address: keypair.publicKey.toString(),
    };
  }

  private generateEthKeyPair(index: number) {
    const seedBuffer = bip39.mnemonicToSeedSync(this.seed);
    const hdNode = ethers.HDNodeWallet.fromSeed(seedBuffer);
    const derivedNode = hdNode.derivePath(`m/44'/60'/0'/0/${index}`);

    return { pk: derivedNode.privateKey, address: derivedNode.address };
  }
}
