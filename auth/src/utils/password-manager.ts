import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

let scryptAsync = promisify(scrypt);

export class PasswordManager {
  static async hashPassword(rawPass: string) {
    let salt = randomBytes(8).toString("hex");
    let hash = (await scryptAsync(rawPass, salt, 64)) as Buffer;
    return `${hash.toString("hex")}.${salt}`;
  }

  static async comparePassword(
    rawPass: string,
    hashPass: string
  ): Promise<boolean> {
    let [hash, salt] = hashPass.split(".");
    let candidateHash = (await scryptAsync(rawPass, salt, 64)) as Buffer;
    return candidateHash.toString("hex") === hash;
  }
}
