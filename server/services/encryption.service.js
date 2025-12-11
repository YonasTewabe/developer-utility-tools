const crypto = require("crypto");

class EncryptionService {
  constructor() {
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm";
    this.salt = process.env.ENCRYPTION_SALT || "default-salt";

    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("ENCRYPTION_KEY environment variable is not set");
    }

    const ivHex = process.env.ENCRYPTION_IV;
    if (!ivHex) {
      throw new Error("ENCRYPTION_IV environment variable is not set");
    }

    const saltString = Buffer.from(this.salt, "hex").toString("utf8");
    this.key = crypto.pbkdf2Sync(encryptionKey, saltString, 1000, 32, "sha256");
    this.iv = Buffer.from(ivHex, "hex");
  }

  encryptText(text) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();
    const encryptedWithTag = encrypted + authTag.toString("hex");

    return `${this.iv.toString("hex")}:${encryptedWithTag}`;
  }

  encryptObject(obj) {
    const jsonString = JSON.stringify(obj);
    return this.encryptText(jsonString);
  }

  decryptText(encryptedText) {
    const trimmedText = String(encryptedText).trim();
    const [ivHex, dataWithTag] = trimmedText.split(":");
    if (!ivHex || !dataWithTag) {
      throw new Error("Invalid encrypted text format");
    }

    const trimmedIv = ivHex.trim();
    const trimmedData = dataWithTag.trim();

    const authTagLength = 32;
    const data = trimmedData.slice(0, -authTagLength);
    const authTagHex = trimmedData.slice(-authTagLength);

    const iv = Buffer.from(trimmedIv, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  decryptObject(encryptedText) {
    const decryptedText = this.decryptText(encryptedText);
    return JSON.parse(decryptedText);
  }

  isEncrypted(text) {
    try {
      if (typeof text !== "string") {
        return false;
      }

      const trimmedText = text.trim();
      const parts = trimmedText.split(":");

      if (parts.length !== 2) {
        return false;
      }

      const [ivHex, dataWithTag] = parts;
      if (!ivHex || !dataWithTag) {
        return false;
      }

      const trimmedIv = ivHex.trim();
      const trimmedData = dataWithTag.trim();

      if (trimmedData.length < 32) {
        return false;
      }

      const hexPattern = /^[0-9a-fA-F]+$/;
      if (!hexPattern.test(trimmedIv) || !hexPattern.test(trimmedData)) {
        return false;
      }

      Buffer.from(trimmedIv, "hex");
      Buffer.from(trimmedData, "hex");

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = EncryptionService;
