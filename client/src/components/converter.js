import React, { useState } from "react";
import { toast } from "react-toastify";
import * as yaml from "js-yaml";
import "react-toastify/dist/ReactToastify.css";

function Converter() {
  const [sourceType, setSourceType] = useState("json");
  const [destType, setDestType] = useState("env");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

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

  const parseInput = (text, type) => {
    switch (type.toLowerCase()) {
      case "json":
        try {
          const parsed = JSON.parse(text);
          if (typeof parsed !== "object" || parsed === null) {
            throw new Error("JSON must be an object");
          }
          return parsed;
        } catch (e) {
          throw new Error(`Invalid JSON: ${e.message}`);
        }

      case "yaml":
        try {
          const parsed = yaml.load(text);
          if (typeof parsed !== "object" || parsed === null) {
            throw new Error("YAML must represent an object");
          }
          return parsed;
        } catch (e) {
          throw new Error(`Invalid YAML: ${e.message}`);
        }

      case "formdata":
        try {
          const obj = {};
          const lines = text.trim().split("\n");
          lines.forEach((line) => {
            line = line.trim();
            if (!line || line.startsWith("#")) return;

            if (line.includes("=")) {
              const [key, ...valueParts] = line.split("=");
              const value = valueParts.join("=").trim();
              const cleanValue = value.replace(/^["']|["']$/g, "");
              obj[key.trim()] = cleanValue;
            }
          });
          return obj;
        } catch (e) {
          throw new Error(`Invalid FormData: ${e.message}`);
        }

      default:
        throw new Error(`Unsupported source type: ${type}`);
    }
  };

  const convertToFormat = (obj, type) => {
    switch (type.toLowerCase()) {
      case "json":
        return JSON.stringify(obj, null, 2);

      case "yaml":
        try {
          return yaml.dump(obj, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false,
          });
        } catch (e) {
          throw new Error(`Error converting to YAML: ${e.message}`);
        }

      case "env":
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

        const flattened = flattenObject(obj);
        return Object.entries(flattened)
          .map(([key, value]) => {
            const needsQuotes =
              value.includes(" ") || value.includes("#") || value.includes("=");
            if (needsQuotes) {
              return `${key}="${value.replace(/"/g, '\\"')}"`;
            }
            return `${key}=${value}`;
          })
          .join("\n");

      case "formdata":
        const formDataToString = (obj, prefix = "") => {
          const lines = [];
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const fullKey = prefix ? `${prefix}[${key}]` : key;
              const value = obj[key];

              if (
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value)
              ) {
                lines.push(...formDataToString(value, fullKey));
              } else {
                const stringValue = Array.isArray(value)
                  ? JSON.stringify(value)
                  : String(value);
                lines.push(`${fullKey}=${stringValue}`);
              }
            }
          }
          return lines;
        };
        return formDataToString(obj).join("\n");

      default:
        throw new Error(`Unsupported destination type: ${type}`);
    }
  };

  const handleConvert = (e) => {
    e.preventDefault();
    setError("");
    setResult("");

    if (!input.trim()) {
      setError(`Please enter ${sourceType.toUpperCase()} to convert`);
      return;
    }

    if (sourceType.toLowerCase() === destType.toLowerCase()) {
      setError("Source and destination types cannot be the same");
      return;
    }

    try {
      const parsed = parseInput(input, sourceType);
      const converted = convertToFormat(parsed, destType);
      setResult(converted);
    } catch (error) {
      setError(error.message);
    }
  };

  const clearAll = () => {
    setInput("");
    setResult("");
    setError("");
  };

  const getInputLabel = () => {
    return `${sourceType.toUpperCase()} Input`;
  };

  const getOutputLabel = () => {
    return `${destType.toUpperCase()} Output`;
  };

  return (
    <div className="section">
      <form className="form" onSubmit={handleConvert}>
        <div className="format-selectors">
          <div className="form-group">
            <label>Source Format</label>
            <select
              className="textarea"
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value);
                setResult("");
                setError("");
              }}
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="formdata">FormData</option>
            </select>
          </div>

          <div className="form-group">
            <label>Destination Format</label>
            <select
              className="textarea"
              value={destType}
              onChange={(e) => {
                setDestType(e.target.value);
                setResult("");
                setError("");
              }}
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="env">.env</option>
              <option value="formdata">FormData</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="converter-input">{getInputLabel()}</label>
          <textarea
            id="converter-input"
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            required
            placeholder={`Enter your ${sourceType.toUpperCase()} data here...`}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !input.trim() ||
              sourceType.toLowerCase() === destType.toLowerCase()
            }
          >
            🔄 Convert {sourceType.toUpperCase()} to {destType.toUpperCase()}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearAll}
          >
            🗑️ Clear
          </button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {result && (
          <div className="result-container">
            <div className="result-header">
              <label>{getOutputLabel()}</label>
              <button
                type="button"
                className="btn-copy"
                onClick={() => copyToClipboard(result)}
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
            </div>
            <textarea
              className="textarea result-textarea"
              value={result}
              readOnly
              rows={15}
            />
          </div>
        )}
      </form>
    </div>
  );
}

export default Converter;
