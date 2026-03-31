import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LineNumberedTextarea({
  id,
  label,
  value,
  onChange,
  rows,
  placeholder,
  readOnly,
  className = "",
}) {
  const gutterRef = useRef(null);
  const safeValue = value ?? "";

  const lineCount = useMemo(() => {
    if (safeValue === "") return 1;
    return String(safeValue).split("\n").length;
  }, [safeValue]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");
  }, [lineCount]);

  const handleScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className={`ln-wrapper ${safeValue ? "has-value" : ""}`}>
        <pre className="ln-gutter" ref={gutterRef} aria-hidden="true">
          {lineNumbers}
        </pre>
        <textarea
          id={id}
          className={`textarea ${className}`}
          value={safeValue}
          onChange={onChange}
          onScroll={handleScroll}
          rows={rows}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

export default function DiffChecker() {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [diffResult, setDiffResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const compareText = (a, b) => {
    const aLines = a.split("\n");
    const bLines = b.split("\n");

    const lines = [];
    const maxLines = Math.max(aLines.length, bLines.length);

    for (let i = 0; i < maxLines; i++) {
      const left = aLines[i] || "";
      const right = bLines[i] || "";
      const isDifferent = left !== right;

      lines.push({
        lineNumber: i + 1,
        left,
        right,
        isDifferent,
      });
    }

    return lines;
  };

  const handleCompare = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDiffResult(null);

    setTimeout(() => {
      if (!leftInput.trim() || !rightInput.trim()) {
        setError("Please fill both fields before comparing.");
        setLoading(false);
        return;
      }

      const diffs = compareText(leftInput, rightInput);
      setDiffResult(diffs);
      setLoading(false);
    }, 300);
  };

  const clearInputs = () => {
    setLeftInput("");
    setRightInput("");
    setDiffResult(null);
    setError("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-right",
      autoClose: 1000,
    });
  };

  return (
    <>
      <div className="section">
        <form className="form" onSubmit={handleCompare}>
          <div className="diff-inputs">
            <LineNumberedTextarea
              id="diff-original-input"
              label="Original Text"
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              rows={14}
              placeholder="Enter original text..."
            />

            <LineNumberedTextarea
              id="diff-modified-input"
              label="Modified Text"
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              rows={14}
              placeholder="Enter modified text..."
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !leftInput.trim() || !rightInput.trim()}
            >
              {loading ? "Comparing..." : "Compare"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearInputs}
            >
              Clear
            </button>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}

          {diffResult && (
            <div className="result-container">
              <div className="result-header">
                <label>
                  {diffResult.filter((line) => line.isDifferent).length === 0
                    ? "✔️ No differences found!"
                    : `Difference found on ${
                        diffResult.filter((line) => line.isDifferent).length
                      } ${
                        diffResult.filter((line) => line.isDifferent).length ===
                        1
                          ? "line"
                          : "lines"
                      }`}
                </label>

                {diffResult.filter((line) => line.isDifferent).length > 0 && (
                  <button
                    type="button"
                    className="btn-copy"
                    onClick={() => {
                      const diffSummary = diffResult
                        .filter((line) => line.isDifferent)
                        .map(
                          (line) =>
                            `Line ${line.lineNumber}:\n  Left:  ${line.left}\n  Right: ${line.right}`
                        )
                        .join("\n\n");
                      copyToClipboard(diffSummary || "No differences found!");
                    }}
                  >
                    Copy
                  </button>
                )}
              </div>

              {diffResult.filter((line) => line.isDifferent).length > 0 && (
                <div className="diff-comparison">
                  <div className="diff-side">
                    <div className="diff-side-header">Original Text</div>
                    <div className="diff-content">
                      {diffResult
                        .filter((line) => line.isDifferent)
                        .map((line, index) => (
                          <div
                            key={index}
                            className="diff-line diff-line-different"
                          >
                            <span className="diff-line-number">
                              {line.lineNumber}
                            </span>
                            <span className="diff-line-text">
                              {line.left || "\u00A0"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="diff-side">
                    <div className="diff-side-header">Modified Text</div>
                    <div className="diff-content">
                      {diffResult
                        .filter((line) => line.isDifferent)
                        .map((line, index) => (
                          <div
                            key={index}
                            className="diff-line diff-line-different"
                          >
                            <span className="diff-line-number">
                              {line.lineNumber}
                            </span>
                            <span className="diff-line-text">
                              {line.right || "\u00A0"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
