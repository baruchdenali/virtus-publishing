// @ts-nocheck
/**
 * AES-256-GCM Hardware-Accelerated Encryption Engine
 * Module 2: Military-grade authenticated encryption for AdGPT campaign payloads.
 * Uses Node.js crypto with AES-256-GCM — individual IVs per operation, auth tag validation.
 */

import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const KEY_SIZE = 32; // 256 bits

function getMasterKey(): Buffer {
  const envKey = process.env.ADGPT_MASTER_KEY;
  if (envKey) {
    // Derive 32-byte key from env using HKDF-like approach
    const hash = require("crypto").createHash("sha256");
    hash.update(envKey);
    return hash.digest();
  }
  // Fallback deterministic key (CHANGE IN PRODUCTION — use env var)
  const hash = require("crypto").createHash("sha256");
  hash.update("virtus-adgpt-default-master-key-2026");
  return hash.digest();
}

const MASTER_KEY = getMasterKey();

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string;         // hex
  authTag: string;    // hex
}

/**
 * Encrypt a JSON-serializable payload using AES-256-GCM.
 * Returns { ciphertext (base64), iv (hex), authTag (hex) }
 */
export function encryptPayload(payload: unknown): EncryptedPayload {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const plaintext = JSON.stringify(payload);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt an AES-256-GCM encrypted payload.
 * Validates auth tag. Throws on tampering.
 */
export function decryptPayload(encrypted: EncryptedPayload): unknown {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    MASTER_KEY,
    Buffer.from(encrypted.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));
  const ciphertext = Buffer.from(encrypted.ciphertext, "base64");
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}

/**
 * Generate a deterministic SHA-256 cache key from a URL.
 * Zero-thrash: same URL always produces same key.
 */
export function getCacheKey(url: string, prefix = "adgpt:scrape"): string {
  const hash = require("crypto").createHash("sha256");
  hash.update(`${prefix}:${url}`);
  return hash.digest("hex");
}
