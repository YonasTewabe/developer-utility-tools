import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("encryption");

  const [encryptInput, setEncryptInput] = useState("");
  const [encryptResult, setEncryptResult] = useState("");
  const [encryptLoading, setEncryptLoading] = useState(false);
  const [encryptError, setEncryptError] = useState("");

  const [decryptInput, setDecryptInput] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [decryptError, setDecryptError] = useState("");

  const [formatInput, setFormatInput] = useState("");
  const [formatResult, setFormatResult] = useState("");
  const [formatError, setFormatError] = useState("");

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

  const handleFormat = (e) => {
    e.preventDefault();
    setFormatError("");
    setFormatResult("");

    if (!formatInput.trim()) {
      setFormatError("Please enter JSON to format");
      return;
    }

    try {
      // Parse the JSON
      const parsed = JSON.parse(formatInput);

      // Format with proper indentation (2 spaces)
      const formatted = JSON.stringify(parsed, null, 2);
      setFormatResult(formatted);
    } catch (error) {
      setFormatError(`Invalid JSON: ${error.message}`);
    }
  };

  const clearFormat = () => {
    setFormatInput("");
    setFormatResult("");
    setFormatError("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Encryption Decryption Tool</h1>
      </header>
      <nav className="sub-header">
        <div className="tab-navigation">
          <button
            className={`tab ${activeTab === "encryption" ? "active" : ""}`}
            onClick={() => setActiveTab("encryption")}
          >
            Encryption/Decryption
          </button>
          <button
            className={`tab ${activeTab === "json" ? "active" : ""}`}
            onClick={() => setActiveTab("json")}
          >
            JSON Formatter
          </button>
        </div>
      </nav>

      <div className="container">
        {activeTab === "encryption" && (
          <>
            <div className="section">
              <form onSubmit={handleEncrypt} className="form">
                <div className="form-group">
                  <label htmlFor="encrypt-input">Input JSON</label>
                  <textarea
                    id="encrypt-input"
                    className="textarea"
                    value={encryptInput}
                    onChange={(e) => setEncryptInput(e.target.value)}
                    rows={10}
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
                      rows={10}
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
                    rows={10}
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
                      rows={10}
                    />
                  </div>
                )}
              </form>
            </div>
          </>
        )}

        {activeTab === "json" && (
          <>
            <div className="section full-width">
              <form onSubmit={handleFormat} className="form">
                <div className="form-group">
                  <label htmlFor="format-input">Unstructured JSON</label>
                  <textarea
                    id="format-input"
                    className="textarea"
                    value={formatInput}
                    onChange={(e) => setFormatInput(e.target.value)}
                    rows={10}
                    required
                  />
                </div>

                <div className="button-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!formatInput.trim()}
                  >
                    Format JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearFormat}
                  >
                    Clear
                  </button>
                </div>

                {formatError && (
                  <div className="error-message">{formatError}</div>
                )}

                {formatResult && (
                  <div className="result-container">
                    <div className="result-header">
                      <label>Formatted JSON</label>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => copyToClipboard(formatResult)}
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <textarea
                      className="textarea result-textarea"
                      value={formatResult}
                      readOnly
                      rows={10}
                    />
                  </div>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
