/**
 * Client-side encryption service using Web Crypto API
 * Compatible with the server-side encryption format (AES-256-GCM)
 */
class EncryptionService {
  constructor() {
    console.log("[EncryptionService] Initializing encryption service...");
    
    // Get encryption parameters from environment variables
    // React requires REACT_APP_ prefix for environment variables
    const envAlgorithm = process.env.REACT_APP_ENCRYPTION_ALGORITHM;
    console.log("[EncryptionService] REACT_APP_ENCRYPTION_ALGORITHM:", envAlgorithm || "not set (using default)");
    
    if (envAlgorithm) {
      // Convert server format (aes-256-gcm) to Web Crypto API format (AES-GCM)
      const algoLower = envAlgorithm.toLowerCase();
      if (algoLower === "aes-256-gcm" || algoLower === "aes-gcm") {
        this.algorithm = "AES-GCM";
      } else {
        this.algorithm = "AES-GCM"; // Default to AES-GCM
        console.warn(`[EncryptionService] Unsupported algorithm: ${envAlgorithm}. Using AES-GCM.`);
      }
    } else {
      this.algorithm = "AES-GCM";
    }
    console.log("[EncryptionService] Using algorithm:", this.algorithm);
    
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
    this.tagLength = 128; // 128 bits for GCM auth tag
    
    // Get encryption key and salt from environment variables
    this.encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || "default-encryption-key-change-in-production";
    this.encryptionSalt = process.env.REACT_APP_ENCRYPTION_SALT || "default-salt";
    this.encryptionIV = process.env.REACT_APP_ENCRYPTION_IV || null;
    
    console.log("[EncryptionService] REACT_APP_ENCRYPTION_KEY:", this.encryptionKey ? `${this.encryptionKey.substring(0, 10)}...` : "not set");
    console.log("[EncryptionService] REACT_APP_ENCRYPTION_SALT:", this.encryptionSalt || "not set (using default)");
    console.log("[EncryptionService] REACT_APP_ENCRYPTION_IV:", this.encryptionIV ? `${this.encryptionIV.substring(0, 10)}...` : "not set (using random)");
    
    // Validate required environment variables
    if (!process.env.REACT_APP_ENCRYPTION_KEY) {
      console.warn("[EncryptionService] REACT_APP_ENCRYPTION_KEY not set in .env file. Using default key (not secure for production).");
    }
    if (!process.env.REACT_APP_ENCRYPTION_IV) {
      console.warn("[EncryptionService] REACT_APP_ENCRYPTION_IV not set in .env file. Using random IV for each encryption.");
    }
    
    // Initialize the key (async, will be awaited when needed)
    this.cryptoKey = null;
    this.keyInitialized = false;
    this.initKeyPromise = this.initKey();
  }

  /**
   * Initialize the encryption key from environment variables
   */
  async initKey() {
    try {
      console.log("[EncryptionService] Initializing encryption key...");
      // Use environment variables for key and salt
      const keyMaterial = this.encryptionKey;
      const salt = this.encryptionSalt;
      
      console.log("[EncryptionService] Deriving key using PBKDF2 with salt:", salt);
      // Derive key using PBKDF2 (similar to server-side)
      const keyData = await this.deriveKey(keyMaterial, salt);
      this.cryptoKey = keyData;
      this.keyInitialized = true;
      console.log("[EncryptionService] Encryption key initialized successfully");
    } catch (error) {
      console.error("[EncryptionService] Error initializing encryption key:", error);
      console.error("[EncryptionService] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(`Failed to initialize encryption key: ${error.message}`);
    }
  }

  /**
   * Convert hex string to UTF-8 string (matching server behavior)
   * The server did: Buffer.from(salt, "hex").toString("utf8")
   */
  hexToUtf8(hex) {
    try {
      // Check if it's valid hex
      if (!/^[0-9a-fA-F]+$/.test(hex)) {
        // Not hex, return as is
        return hex;
      }
      // Convert hex to bytes, then to UTF-8 string
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (error) {
      // If conversion fails, return original
      return hex;
    }
  }

  /**
   * Derive a crypto key from a password using PBKDF2
   * Matches server behavior: salt is converted from hex to UTF-8 if it's hex
   */
  async deriveKey(password, salt) {
    try {
      console.log("[EncryptionService] Starting key derivation...");
      console.log("[EncryptionService] Original salt:", salt);
      
      // Match server behavior: convert salt from hex to UTF-8 if it's hex
      // Server did: Buffer.from(this.salt, "hex").toString("utf8")
      const saltString = this.hexToUtf8(salt);
      console.log("[EncryptionService] Salt after hex conversion (if applicable):", saltString);
      
      const encoder = new TextEncoder();
      
      console.log("[EncryptionService] Importing password key...");
      const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const saltBuffer = encoder.encode(saltString);
      console.log("[EncryptionService] Salt buffer length:", saltBuffer.length, "bytes");
      console.log("[EncryptionService] Deriving key with PBKDF2 (1000 iterations, SHA-256)...");
      
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBuffer,
          iterations: 1000,
          hash: "SHA-256",
        },
        passwordKey,
        {
          name: this.algorithm,
          length: this.keyLength,
        },
        false,
        ["encrypt", "decrypt"]
      );

      console.log("[EncryptionService] Key derivation successful");
      return key;
    } catch (error) {
      console.error("[EncryptionService] Key derivation failed:", error);
      console.error("[EncryptionService] Derivation error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  /**
   * Generate or get IV from environment variable
   * If ENCRYPTION_IV is set, use it (for compatibility with server)
   * Otherwise, generate a random IV (more secure)
   */
  generateIV() {
    if (this.encryptionIV) {
      // Use the IV from environment variable (convert hex to Uint8Array)
      try {
        const ivHex = this.encryptionIV.trim();
        if (ivHex.length === this.ivLength * 2) { // 12 bytes = 24 hex chars
          return new Uint8Array(this.hexToArrayBuffer(ivHex));
        } else {
          console.warn(`ENCRYPTION_IV length mismatch. Expected ${this.ivLength * 2} hex chars, got ${ivHex.length}. Using random IV.`);
          return crypto.getRandomValues(new Uint8Array(this.ivLength));
        }
      } catch (error) {
        console.warn("Error parsing ENCRYPTION_IV from .env. Using random IV.", error);
        return crypto.getRandomValues(new Uint8Array(this.ivLength));
      }
    }
    // Generate random IV (more secure, but not compatible with fixed IV from server)
    return crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  /**
   * Convert array buffer to hex string
   */
  arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Convert hex string to array buffer
   */
  hexToArrayBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
  }

  /**
   * Encrypt text
   */
  async encryptText(text) {
    try {
      console.log("[EncryptionService] Starting encryption...");
      console.log("[EncryptionService] Input text length:", text.length);
      
      // Ensure key is initialized
      if (!this.keyInitialized) {
        console.log("[EncryptionService] Key not initialized, waiting for initialization...");
        await this.initKeyPromise;
      }
      
      if (!this.cryptoKey) {
        console.error("[EncryptionService] Crypto key is null after initialization!");
        throw new Error("Encryption key not available");
      }

      console.log("[EncryptionService] Encoding text to UTF-8...");
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      console.log("[EncryptionService] Encoded data length:", data.length, "bytes");
      
      console.log("[EncryptionService] Generating IV...");
      const iv = this.generateIV();
      const ivHex = this.arrayBufferToHex(iv);
      console.log("[EncryptionService] IV (hex):", ivHex);

      console.log("[EncryptionService] Encrypting with", this.algorithm, "...");
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
          tagLength: this.tagLength,
        },
        this.cryptoKey,
        data
      );

      console.log("[EncryptionService] Encryption successful, encrypted length:", encrypted.byteLength, "bytes");

      // Extract the ciphertext and auth tag
      // In GCM mode, the auth tag is appended to the ciphertext
      const tagLengthBytes = this.tagLength / 8;
      const ciphertextLength = encrypted.byteLength - tagLengthBytes;
      
      const ciphertext = new Uint8Array(encrypted, 0, ciphertextLength);
      const authTag = new Uint8Array(encrypted, ciphertextLength, tagLengthBytes);

      // Format: iv: ciphertext + authTag (as hex)
      const ciphertextHex = this.arrayBufferToHex(ciphertext);
      const authTagHex = this.arrayBufferToHex(authTag);
      const encryptedWithTag = ciphertextHex + authTagHex;

      const result = `${ivHex}:${encryptedWithTag}`;
      console.log("[EncryptionService] Encryption complete, result length:", result.length);
      return result;
    } catch (error) {
      console.error("[EncryptionService] Encryption failed:", error);
      console.error("[EncryptionService] Encryption error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        algorithm: this.algorithm,
        keyInitialized: this.keyInitialized
      });
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt object (converts to JSON first)
   */
  async encryptObject(obj) {
    const jsonString = JSON.stringify(obj);
    return await this.encryptText(jsonString);
  }

  /**
   * Decrypt text
   */
  async decryptText(encryptedText) {
    try {
      console.log("[EncryptionService] Starting decryption...");
      console.log("[EncryptionService] Encrypted text length:", encryptedText.length);
      
      // Ensure key is initialized
      if (!this.keyInitialized) {
        console.log("[EncryptionService] Key not initialized, waiting for initialization...");
        await this.initKeyPromise;
      }
      
      if (!this.cryptoKey) {
        console.error("[EncryptionService] Crypto key is null after initialization!");
        throw new Error("Decryption key not available");
      }

      const trimmedText = String(encryptedText).trim();
      console.log("[EncryptionService] Trimmed encrypted text length:", trimmedText.length);
      
      const parts = trimmedText.split(":");
      console.log("[EncryptionService] Split into", parts.length, "parts");

      if (parts.length !== 2) {
        console.error("[EncryptionService] Invalid format: expected 2 parts separated by ':', got", parts.length);
        throw new Error("Invalid encrypted text format: expected format 'iv:data'");
      }

      const [ivHex, dataWithTagHex] = parts;
      if (!ivHex || !dataWithTagHex) {
        console.error("[EncryptionService] Invalid format: missing IV or data");
        throw new Error("Invalid encrypted text format: missing IV or encrypted data");
      }

      console.log("[EncryptionService] IV (hex):", ivHex, "length:", ivHex.length);
      console.log("[EncryptionService] Data with tag (hex):", dataWithTagHex.substring(0, 50) + "...", "length:", dataWithTagHex.length);

      // Extract ciphertext and auth tag
      const tagLengthBytes = this.tagLength / 8;
      const tagLengthHex = tagLengthBytes * 2; // Each byte is 2 hex chars
      
      if (dataWithTagHex.length < tagLengthHex) {
        console.error("[EncryptionService] Data too short: expected at least", tagLengthHex, "hex chars, got", dataWithTagHex.length);
        throw new Error(`Invalid encrypted text format: data too short (expected at least ${tagLengthHex} hex characters)`);
      }

      const ciphertextHex = dataWithTagHex.slice(0, -tagLengthHex);
      const authTagHex = dataWithTagHex.slice(-tagLengthHex);
      
      console.log("[EncryptionService] Ciphertext length:", ciphertextHex.length, "hex chars");
      console.log("[EncryptionService] Auth tag length:", authTagHex.length, "hex chars");

      const iv = new Uint8Array(this.hexToArrayBuffer(ivHex));
      const ciphertext = new Uint8Array(this.hexToArrayBuffer(ciphertextHex));
      const authTag = new Uint8Array(this.hexToArrayBuffer(authTagHex));

      // Combine ciphertext and auth tag for decryption
      const encrypted = new Uint8Array(ciphertext.length + authTag.length);
      encrypted.set(ciphertext);
      encrypted.set(authTag, ciphertext.length);

      console.log("[EncryptionService] Decrypting with", this.algorithm, "...");
      console.log("[EncryptionService] IV bytes:", Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''));
      console.log("[EncryptionService] Encrypted data length:", encrypted.length, "bytes");
      console.log("[EncryptionService] First 20 bytes of encrypted data:", Array.from(encrypted.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      
      try {
        const decrypted = await crypto.subtle.decrypt(
          {
            name: this.algorithm,
            iv: iv,
            tagLength: this.tagLength,
          },
          this.cryptoKey,
          encrypted
        );

        console.log("[EncryptionService] Decryption successful, decrypted length:", decrypted.byteLength, "bytes");
        const decoder = new TextDecoder();
        const result = decoder.decode(decrypted);
        console.log("[EncryptionService] Decoded result length:", result.length, "chars");
        return result;
      } catch (decryptError) {
        console.error("[EncryptionService] Web Crypto decrypt() failed:", decryptError);
        console.error("[EncryptionService] This usually means:");
        console.error("  1. The encryption key doesn't match the one used for encryption");
        console.error("  2. The IV doesn't match");
        console.error("  3. The data was corrupted or modified");
        console.error("  4. The auth tag verification failed (GCM mode)");
        
        // Check if this might be data encrypted by the old server
        console.error("[EncryptionService] Current key material:", this.encryptionKey ? `${this.encryptionKey.substring(0, 20)}...` : "not set");
        console.error("[EncryptionService] Current salt:", this.encryptionSalt);
        
        throw decryptError;
      }
    } catch (error) {
      console.error("[EncryptionService] Decryption failed:", error);
      console.error("[EncryptionService] Decryption error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        algorithm: this.algorithm,
        keyInitialized: this.keyInitialized,
        encryptionKey: this.encryptionKey ? "set" : "not set",
        encryptionSalt: this.encryptionSalt
      });
      
      // Provide more helpful error message
      if (error.name === "OperationError") {
        throw new Error(`Decryption failed: Authentication tag verification failed. This usually means the encryption key doesn't match, or the data was encrypted with a different key. Check your REACT_APP_ENCRYPTION_KEY in .env file.`);
      }
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt object (parses JSON after decryption)
   */
  async decryptObject(encryptedText) {
    const decryptedText = await this.decryptText(encryptedText);
    return JSON.parse(decryptedText);
  }

  /**
   * Check if text is encrypted (has the correct format)
   */
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

      const [ivHex, dataWithTagHex] = parts;
      if (!ivHex || !dataWithTagHex) {
        return false;
      }

      // Check if both parts are valid hex strings
      const hexPattern = /^[0-9a-fA-F]+$/;
      if (!hexPattern.test(ivHex) || !hexPattern.test(dataWithTagHex)) {
        return false;
      }

      // Check minimum length (IV should be 24 hex chars for 12 bytes, data should have at least tag length)
      const tagLengthBytes = this.tagLength / 8;
      const tagLengthHex = tagLengthBytes * 2;
      
      if (ivHex.length < 24 || dataWithTagHex.length < tagLengthHex) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export a singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;

