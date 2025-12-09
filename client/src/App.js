import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
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
      const response = await axios.post("/api/encryption/encrypt", {
        data: encryptInput,
      });

      if (response.data.statusCode === 200) {
        setEncryptResult(response.data.data);
      } else {
        setEncryptError(response.data.message || "Encryption failed");
      }
    } catch (error) {
      setEncryptError(
        error.response?.data?.message || error.message || "Encryption failed"
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
      // Parse the input - if it's a JSON object with "data" field, extract it
      // Otherwise, use the input as-is
      let encryptedData = decryptInput.trim();

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(encryptedData);
        if (parsed && typeof parsed === "object" && parsed.data) {
          encryptedData = parsed.data;
        }
      } catch (e) {
        // Not JSON, use as-is
      }

      const response = await axios.post("/api/encryption/decrypt", {
        data: encryptedData,
      });

      if (response.data.statusCode === 200) {
        const result = response.data.data;
        // Format the result nicely
        if (response.data.type === "object") {
          setDecryptResult(JSON.stringify(result, null, 2));
        } else {
          setDecryptResult(result);
        }
      } else {
        setDecryptError(response.data.message || "Decryption failed");
      }
    } catch (error) {
      setDecryptError(
        error.response?.data?.message || error.message || "Decryption failed"
      );
    } finally {
      setDecryptLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
    <div className="App">
      <header className="App-header">
        <h1>Encryption Decryption Tool</h1>
      </header>

      <div className="container">
        <div className="section">
          <form onSubmit={handleEncrypt} className="form">
            <div className="form-group">
              <label htmlFor="encrypt-input">Input JSON</label>
              <textarea
                id="encrypt-input"
                className="textarea"
                value={encryptInput}
                onChange={(e) => setEncryptInput(e.target.value)}
                rows={6}
                required
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
              <div className="error-message">{encryptError}</div>
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
                    📋 Copy
                  </button>
                </div>
                <textarea
                  className="textarea result-textarea"
                  value={encryptResult}
                  readOnly
                  rows={4}
                />
              </div>
            )}
          </form>
        </div>

        <div className="section">
          <form onSubmit={handleDecrypt} className="form">
            <div className="form-group">
              <label htmlFor="decrypt-input">Encrypted Data</label>
              <textarea
                id="decrypt-input"
                className="textarea"
                value={decryptInput}
                onChange={(e) => setDecryptInput(e.target.value)}
                rows={6}
                required
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
              <div className="error-message">{decryptError}</div>
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
                    📋 Copy
                  </button>
                </div>
                <textarea
                  className="textarea result-textarea"
                  value={decryptResult}
                  readOnly
                  rows={8}
                />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
