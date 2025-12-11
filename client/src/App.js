import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const [jsonToEnvInput, setJsonToEnvInput] = useState("");
  const [jsonToEnvResult, setJsonToEnvResult] = useState("");
  const [jsonToEnvError, setJsonToEnvError] = useState("");

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

  const flattenObject = (obj, prefix = "", result = {}) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        const value = obj[key];

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          // Recursively flatten nested objects
          flattenObject(value, newKey.toUpperCase(), result);
        } else {
          // Handle arrays and primitive values
          if (Array.isArray(value)) {
            result[newKey.toUpperCase()] = JSON.stringify(value);
          } else if (typeof value === "string") {
            result[newKey.toUpperCase()] = value;
          } else {
            result[newKey.toUpperCase()] = String(value);
          }
        }
      }
    }
    return result;
  };

  const handleJsonToEnv = (e) => {
    e.preventDefault();
    setJsonToEnvError("");
    setJsonToEnvResult("");

    if (!jsonToEnvInput.trim()) {
      setJsonToEnvError("Please enter JSON to convert");
      return;
    }

    try {
      // Parse the JSON
      const parsed = JSON.parse(jsonToEnvInput);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setJsonToEnvError(
          "Please provide a valid JSON object (not an array or primitive)"
        );
        return;
      }

      // Flatten the object
      const flattened = flattenObject(parsed);

      // Convert to .env format
      const envFormat = Object.entries(flattened)
        .map(([key, value]) => {
          // Escape values that contain special characters or spaces
          const needsQuotes =
            value.includes(" ") || value.includes("#") || value.includes("=");
          if (needsQuotes) {
            return `${key}="${value.replace(/"/g, '\\"')}"`;
          }
          return `${key}=${value}`;
        })
        .join("\n");

      setJsonToEnvResult(envFormat);
    } catch (error) {
      setJsonToEnvError(`Invalid JSON: ${error.message}`);
    }
  };

  const clearJsonToEnv = () => {
    setJsonToEnvInput("");
    setJsonToEnvResult("");
    setJsonToEnvError("");
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
          <button
            className={`tab ${activeTab === "converter" ? "active" : ""}`}
            onClick={() => setActiveTab("converter")}
          >
            Converter
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

        {activeTab === "converter" && (
          <>
            <div className="section full-width">
              <form onSubmit={handleJsonToEnv} className="form">
                <div className="form-group">
                  <label htmlFor="json-to-env-input">JSON Object</label>
                  <textarea
                    id="json-to-env-input"
                    className="textarea"
                    value={jsonToEnvInput}
                    onChange={(e) => setJsonToEnvInput(e.target.value)}
                    rows={12}
                    placeholder='{"API_KEY":"12345","DATABASE_URL":"localhost:5432","NODE_ENV":"production"}'
                    required
                  />
                </div>

                <div className="button-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!jsonToEnvInput.trim()}
                  >
                    Convert to .env
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={clearJsonToEnv}
                  >
                    Clear
                  </button>
                </div>

                {jsonToEnvError && (
                  <div className="error-message">{jsonToEnvError}</div>
                )}

                {jsonToEnvResult && (
                  <div className="result-container">
                    <div className="result-header">
                      <label>.env File Format</label>
                      <button
                        type="button"
                        className="btn-copy"
                        onClick={() => copyToClipboard(jsonToEnvResult)}
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <textarea
                      className="textarea result-textarea"
                      value={jsonToEnvResult}
                      readOnly
                      rows={15}
                    />
                  </div>
                )}
              </form>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
