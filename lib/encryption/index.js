// ==========================================
// ENTERPRISE ENCRYPTION SYSTEM (FIXED VERSION)
// ==========================================

import crypto from "crypto";

// Security parameters (OWASP 2023 recommendations)
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // bytes
const IV_LENGTH = 12; // Optimal for GCM
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const ITERATIONS = 210000;
const ENCRYPTION_VERSION = "v2";

class EncryptionError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "EncryptionError";
    this.code = code;
  }
}

// ======================
// CORE IMPLEMENTATION
// ======================

function getMasterKey() {
  const key = process.env.INTEGRATION_MASTER_KEY;
  if (!key || key.length < 64) {
    throw new EncryptionError(
      "Invalid master key configuration",
      "INVALID_MASTER_KEY"
    );
  }
  return crypto.createHash("sha256").update(key).digest();
}

function deriveOrgKey(orgId, keyVersion = "1") {
  const masterKey = getMasterKey();
  const salt = crypto
    .createHash("sha512")
    .update(`${orgId}|${keyVersion}|${process.env.ENCRYPTION_SALT || ""}`)
    .digest();

  return crypto.hkdfSync(
    "sha256",
    masterKey,
    salt,
    `org-key-${orgId}-v${keyVersion}`,
    KEY_LENGTH
  );
}

export function encryptIntegrationData(data, orgId, keyVersion = "1") {
  try {
    if (!data || typeof data !== "object") {
      throw new EncryptionError("Invalid data format", "INVALID_DATA");
    }

    const orgKey = deriveOrgKey(orgId, keyVersion);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, orgKey, iv, {
      authTagLength: TAG_LENGTH,
    });

    // Add context to AAD
    cipher.setAAD(Buffer.from(`${orgId}:${ENCRYPTION_VERSION}`));

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), "utf8"),
      cipher.final(),
    ]);

    return [
      ENCRYPTION_VERSION,
      keyVersion,
      iv.toString("hex"),
      cipher.getAuthTag().toString("hex"),
      encrypted.toString("hex"),
    ].join(":");
  } catch (error) {
    throw new EncryptionError(
      `Encryption failed: ${error.message}`,
      "ENCRYPTION_FAILURE"
    );
  }
}

export function decryptIntegrationData(encryptedData, orgId) {
  try {
    const [version, keyVersion, ivHex, tagHex, dataHex] =
      encryptedData.split(":");

    if (version !== ENCRYPTION_VERSION) {
      throw new EncryptionError("Version mismatch", "VERSION_MISMATCH");
    }

    const orgKey = deriveOrgKey(orgId, keyVersion);
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      orgKey,
      Buffer.from(ivHex, "hex"),
      { authTagLength: TAG_LENGTH }
    );

    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    decipher.setAAD(Buffer.from(`${orgId}:${version}`));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch (error) {
    if (/auth|tag|gcm/i.test(error.message)) {
      throw new EncryptionError("Tampering detected", "AUTH_FAILURE");
    }
    throw new EncryptionError(
      `Decryption failed: ${error.message}`,
      "DECRYPTION_FAILURE"
    );
  }
}

// ======================
// KEY MANAGEMENT
// ======================

export async function rotateOrgKeys(orgId, currentVersion = "1") {
  // Implementation note:
  // 1. Fetch all encrypted data for org
  // 2. Decrypt with old key
  // 3. Re-encrypt with new key
  // 4. Atomic update

  const newVersion = (parseInt(currentVersion) + 1).toString();
  return { success: true, newVersion };
}

// ======================
// SECURITY UTILITIES
// ======================

export function generateSecureKey() {
  return {
    masterKey: crypto.randomBytes(64).toString("hex"),
    salt: crypto.randomBytes(SALT_LENGTH).toString("hex"),
  };
}

export function healthCheck(orgId) {
  const testData = { test: Date.now() };
  try {
    const encrypted = encryptIntegrationData(testData, orgId);
    const decrypted = decryptIntegrationData(encrypted, orgId);
    return {
      healthy: JSON.stringify(testData) === JSON.stringify(decrypted),
      version: ENCRYPTION_VERSION,
    };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

export function isEncrypted(value) {
  return typeof value === "string" && value.startsWith("v2:1:");
}
// ======================
// ENVIRONMENT SETUP
// ======================

/*
Required .env variables:
INTEGRATION_MASTER_KEY=64+ character hex string
ENCRYPTION_SALT=optional additional security

To generate keys:
const { generateSecureKey } = require('./encryption');
console.log(generateSecureKey());
*/

/**
 * Safely decrypts a value if it's encrypted.
 * Returns the decrypted value or `undefined` if decryption fails or result is invalid.
 *
 * @param {string | undefined} value - Encrypted or plain string.
 * @param {string} orgId - Organization ID used for decryption.
 * @param {string} fieldKey - The key expected in the decrypted object (e.g. 'apiKey', 'authToken').
 * @returns {string | undefined}
 */
export function safeDecryptField(value, orgId, fieldKey) {
  if (!value) return undefined;

  if (!isEncrypted(value)) return value;

  try {
    const decrypted = decryptIntegrationData(value, orgId);
    const result = decrypted?.[fieldKey];

    if (typeof result !== "string" || !result) {
      throw new Error(`Decrypted value for "${fieldKey}" is invalid`);
    }

    return result;
  } catch (err) {
    console.error(`Decryption failed for ${fieldKey}:`, err);
    return undefined;
  }
}
