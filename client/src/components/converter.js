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

      case "xml":
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, "text/xml");
          const parseError = xmlDoc.querySelector("parsererror");
          if (parseError) {
            throw new Error("Invalid XML structure");
          }

          const xmlToObject = (node) => {
            const obj = {};
            if (node.nodeType === 1) {
              // Element node
              if (node.childNodes.length === 0) {
                return "";
              }

              const textContent = Array.from(node.childNodes)
                .filter((n) => n.nodeType === 3)
                .map((n) => n.textContent)
                .join("")
                .trim();

              const hasOnlyText =
                node.childNodes.length === 1 &&
                node.childNodes[0].nodeType === 3;

              if (hasOnlyText && textContent) {
                return textContent;
              }

              const children = Array.from(node.childNodes).filter(
                (n) => n.nodeType === 1
              );

              if (children.length > 0) {
                children.forEach((child) => {
                  const childName = child.nodeName;
                  const childValue = xmlToObject(child);

                  if (obj[childName]) {
                    if (!Array.isArray(obj[childName])) {
                      obj[childName] = [obj[childName]];
                    }
                    obj[childName].push(childValue);
                  } else {
                    obj[childName] = childValue;
                  }
                });

                if (textContent) {
                  obj._text = textContent;
                }
              } else if (textContent) {
                return textContent;
              }
            }
            return obj;
          };

          const root = xmlDoc.documentElement;
          const result = { [root.nodeName]: xmlToObject(root) };
          return result[root.nodeName] || result;
        } catch (e) {
          throw new Error(`Invalid XML: ${e.message}`);
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

      case "xml":
        try {
          const objectToXml = (obj, rootName = "root") => {
            const escapeXml = (str) => {
              if (typeof str !== "string") return str;
              return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
            };

            const buildXml = (data, tagName) => {
              if (data === null || data === undefined) {
                return `<${tagName}></${tagName}>`;
              }

              if (
                typeof data === "string" ||
                typeof data === "number" ||
                typeof data === "boolean"
              ) {
                return `<${tagName}>${escapeXml(String(data))}</${tagName}>`;
              }

              if (Array.isArray(data)) {
                return data.map((item) => buildXml(item, tagName)).join("");
              }

              if (typeof data === "object") {
                const xmlParts = [];
                for (const key in data) {
                  if (data.hasOwnProperty(key) && key !== "_text") {
                    const value = data[key];
                    if (Array.isArray(value)) {
                      value.forEach((item) => {
                        xmlParts.push(buildXml(item, key));
                      });
                    } else {
                      xmlParts.push(buildXml(value, key));
                    }
                  }
                }
                const xml = xmlParts.join("");
                const textContent = data._text ? escapeXml(data._text) : "";
                return `<${tagName}>${xml}${textContent}</${tagName}>`;
              }

              return `<${tagName}>${escapeXml(String(data))}</${tagName}>`;
            };

            const xmlContent = buildXml(obj, rootName);
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlContent;
          };

          return objectToXml(obj, "root");
        } catch (e) {
          throw new Error(`Error converting to XML: ${e.message}`);
        }

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
              <option value="xml">XML</option>
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
              <option value="env">.env</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="xml">XML</option>
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
            Convert {sourceType.toUpperCase()} to {destType.toUpperCase()}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearAll}
          >
            Clear
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
                Copy
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
