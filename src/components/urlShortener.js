import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UrlShortener() {
  const [urlInput, setUrlInput] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      let urlToShorten = urlInput.trim();

      // Add protocol if missing
      if (!urlToShorten.startsWith("http://") && !urlToShorten.startsWith("https://")) {
        urlToShorten = "https://" + urlToShorten;
      }

      // Validate URL
      if (!isValidUrl(urlToShorten)) {
        setError("Please enter a valid URL (e.g., https://example.com)");
        setLoading(false);
        return;
      }

      // Use is.gd API (free, no API key required)
      const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(urlToShorten)}`;
      
      console.log("[URL Shortener] Shortening URL:", urlToShorten);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errorcode) {
        throw new Error(data.errormessage || "Failed to shorten URL");
      }

      if (data.shorturl) {
        setShortUrl(data.shorturl);
        console.log("[URL Shortener] Shortened URL:", data.shorturl);
        toast.success("URL shortened successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        throw new Error("No short URL returned from service");
      }
    } catch (error) {
      console.error("[URL Shortener] Error:", error);
      setError(error.message || "Failed to shorten URL. Please try again.");
      toast.error("Failed to shorten URL", {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
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

  const clearInput = () => {
    setUrlInput("");
    setShortUrl("");
    setError("");
  };

  return (
    <div className="section">
      <form className="form" onSubmit={handleShorten}>
        <div className="form-group">
          <label htmlFor="url-input">Enter URL to Shorten</label>
          <textarea
            id="url-input"
            className="textarea"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            rows={4}
            required
            placeholder="https://example.com/very/long/url/path..."
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !urlInput.trim()}
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearInput}
          >
            Clear
          </button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {shortUrl && (
          <div className="result-container">
            <div className="result-header">
              <label>Shortened URL</label>
              <button
                type="button"
                className="btn-copy"
                onClick={() => copyToClipboard(shortUrl)}
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
            <div className="short-url-display">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="short-url-link"
              >
                {shortUrl}
              </a>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

