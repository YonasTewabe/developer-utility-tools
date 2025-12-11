import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Formatter() {
  const [formatInput, setFormatInput] = useState("");
  const [formatResult, setFormatResult] = useState("");
  const [formatError, setFormatError] = useState("");
  
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

  const handleFormat = (e) => {
    e.preventDefault();
    setFormatError("");
    setFormatResult("");

    if (!formatInput.trim()) {
      setFormatError("Please enter JSON to format");
      return;
    }

    try {
      const parsed = JSON.parse(formatInput);

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

          {formatError && <div className="error-message">{formatError}</div>}

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
  );
}

export default Formatter;
