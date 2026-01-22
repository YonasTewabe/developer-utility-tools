import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import encryptionService from "../services/encryption.service";

export default function Encryption() {
  const [encryptInput, setEncryptInput] = useState("");
  const [encryptResult, setEncryptResult] = useState("");
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptError, setEncryptError] = useState("");

  const [decryptInput, setDecryptInput] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptError, setDecryptError] = useState("");

  const handleEncrypt = async (e) => {
    e.preventDefault();
    setEncryptLoading(true);
    setEncryptError("");
    setEncryptResult("");

    try {
      if (!encryptInput.trim()) {
        setEncryptError("Input cannot be empty");
        setEncryptLoading(false);
        return;
      }

      let encryptedData;

      // Try to parse as JSON object
      try {
        console.log("[Encryption Component] Attempting to parse as JSON...");
        const jsonData = JSON.parse(encryptInput);
        console.log("[Encryption Component] Parsed as JSON object, encrypting as object...");
        encryptedData = await encryptionService.encryptObject(jsonData);
        console.log("[Encryption Component] Encryption successful (object)");
      } catch (parseError) {
        // If not JSON, encrypt as text
        console.log("[Encryption Component] Not valid JSON, encrypting as text...", parseError.message);
        encryptedData = await encryptionService.encryptText(encryptInput);
        console.log("[Encryption Component] Encryption successful (text)");
      }

      setEncryptResult(encryptedData);
    } catch (error) {
      console.error("[Encryption Component] Encryption error:", error);
      console.error("[Encryption Component] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setEncryptError(
        error.message || "Encryption failed"
      );
    } finally {
      setEncryptLoading(false);
    }
  };

  const handleDecrypt = async (e) => {
    e.preventDefault();
    setDecryptLoading(true);
    setDecryptError("");
    setDecryptResult("");

    try {
      let encryptedData = decryptInput.trim();

      // Try to extract encrypted data from JSON wrapper
      try {
        const parsed = JSON.parse(encryptedData);
        if (parsed && typeof parsed === "object" && parsed.data) {
          encryptedData = parsed.data;
        }
      } catch (e) {
        // Not JSON, use as is
      }

      if (!encryptedData) {
        setDecryptError("Encrypted data is required");
        setDecryptLoading(false);
        return;
      }

      if (!encryptionService.isEncrypted(encryptedData)) {
        setDecryptError("The provided data is not encrypted");
        setDecryptLoading(false);
        return;
      }

      // Try to decrypt as object first
      try {
        console.log("[Encryption Component] Attempting to decrypt as object...");
        const decryptedObject = await encryptionService.decryptObject(encryptedData);
        console.log("[Encryption Component] Decryption successful (object)");
        setDecryptResult(JSON.stringify(decryptedObject, null, 2));
      } catch (objectError) {
        // If object decryption fails, try as text
        console.log("[Encryption Component] Object decryption failed, trying as text...", objectError.message);
        const decryptedText = await encryptionService.decryptText(encryptedData);
        console.log("[Encryption Component] Decryption successful (text)");
        setDecryptResult(decryptedText);
      }
    } catch (error) {
      console.error("[Encryption Component] Decryption error:", error);
      console.error("[Encryption Component] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Provide more helpful error message
      let errorMessage = error.message || "Decryption failed";
      if (error.message && error.message.includes("Authentication tag verification failed")) {
        errorMessage += "\n\nNote: If you're trying to decrypt data encrypted by the old server, make sure your REACT_APP_ENCRYPTION_KEY and REACT_APP_ENCRYPTION_SALT in .env match the server's ENCRYPTION_KEY and ENCRYPTION_SALT.";
      }
      
      setDecryptError(errorMessage);
    } finally {
      setDecryptLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const clearEncrypt = () => {
    setEncryptInput("");
    setEncryptResult("");
    setEncryptError("");
  };

  const clearDecrypt = () => {
    setDecryptInput("");
    setDecryptResult("");
    setDecryptError("");
  };
  return (
    <div className="section">
      <div className="encryption-inputs">
        <form className="form" onSubmit={handleEncrypt}>
          <div className="form-group">
            <label htmlFor="encrypt-input">Input JSON</label>
            <textarea
              id="encrypt-input"
              className="textarea"
              value={encryptInput}
              onChange={(e) => setEncryptInput(e.target.value)}
              rows={14}
              required
              placeholder="Enter JSON data to encrypt..."
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={encryptLoading || !encryptInput.trim()}
            >
              {encryptLoading ? "Encrypting..." : "Encrypt"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearEncrypt}
            >
              Clear
            </button>
          </div>

          {encryptError && (
            <div className="error-message">⚠️ {encryptError}</div>
          )}

          {encryptResult && (
            <div className="result-container">
              <div className="result-header">
                <label>Encrypted Result</label>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard(encryptResult)}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
              <textarea
                className="textarea result-textarea"
                value={encryptResult}
                readOnly
                rows={10}
              />
            </div>
          )}
        </form>

        <form className="form" onSubmit={handleDecrypt}>
          <div className="form-group">
            <label htmlFor="decrypt-input">Encrypted Data</label>
            <textarea
              id="decrypt-input"
              className="textarea"
              value={decryptInput}
              onChange={(e) => setDecryptInput(e.target.value)}
              rows={14}
              required
              placeholder="Enter encrypted data to decrypt..."
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={decryptLoading || !decryptInput.trim()}
            >
              {decryptLoading ? "Decrypting..." : "Decrypt"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearDecrypt}
            >
              Clear
            </button>
          </div>

          {decryptError && (
            <div className="error-message">⚠️ {decryptError}</div>
          )}

          {decryptResult && (
            <div className="result-container">
              <div className="result-header">
                <label>Decrypted Result</label>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={() => copyToClipboard(decryptResult)}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
              <textarea
                className="textarea result-textarea"
                value={decryptResult}
                readOnly
                rows={10}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
