import React, { useState } from 'react'
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Converter() {

    const [jsonToEnvInput, setJsonToEnvInput] = useState("");
    const [jsonToEnvResult, setJsonToEnvResult] = useState("");
    const [jsonToEnvError, setJsonToEnvError] = useState("");

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
              flattenObject(value, newKey.toUpperCase(), result);
            } else {
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
    
          const flattened = flattenObject(parsed);
    
          const envFormat = Object.entries(flattened)
            .map(([key, value]) => {
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
            rows={10}
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
  )
}

export default Converter;