// lib/encryption.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const keyHex = process.env.ENCRYPTION_KEY;

if (!keyHex || keyHex.length !== 64) {
  throw new Error(
    "ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes) for AES-256-GCM"
  );
}

const KEY = Buffer.from(keyHex, "hex");
if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY decoded to an invalid key length");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(payload: string): string {
  const [ivHex, authTagHex, encryptedHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}