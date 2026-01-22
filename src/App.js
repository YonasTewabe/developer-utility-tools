import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Encryption from "./components/encryption";
import Formatter from "./components/formatter";
import Converter from "./components/converter";
import DiffChecker from "./components/diffChecker";
import UrlShortener from "./components/urlShortener";

function App() {
  const [activeTab, setActiveTab] = useState("encryption");
  const [resetKey, setResetKey] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleClearAll = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className={`App ${darkMode ? "dark-mode" : ""}`}>
      <nav className="sidebar">
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
            File Format Converter
          </button>
          <button
            className={`tab ${activeTab === "diffChecker" ? "active" : ""}`}
            onClick={() => setActiveTab("diffChecker")}
          >
            Diff Checker
          </button>
          <button
            className={`tab ${activeTab === "urlShortener" ? "active" : ""}`}
            onClick={() => setActiveTab("urlShortener")}
          >
            URL Shortener
          </button>
        </div>
        <div className="sidebar-actions">
          <div className="theme-toggle-container">
            <div
              className={`theme-toggle-switch ${darkMode ? "dark" : "light"}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="theme-toggle-track">
                <div className="theme-toggle-icons">
                  <span className="theme-icon">☼</span>
                  <span className="theme-icon">🌙</span>
                </div>
                <div className="theme-toggle-thumb"></div>
              </div>
            </div>
          </div>
          <button className="clear-all-btn" onClick={handleClearAll}>
            Clear All
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div
          className={`container ${
            activeTab === "encryption" ||
            activeTab === "json" ||
            activeTab === "converter" ||
            activeTab === "diffChecker" ||
            activeTab === "urlShortener"
              ? "full-width"
              : ""
          }`}
        >
          {activeTab === "encryption" && <Encryption key={resetKey} />}
          {activeTab === "json" && <Formatter key={resetKey} />}
          {activeTab === "converter" && <Converter key={resetKey} />}
          {activeTab === "diffChecker" && <DiffChecker key={resetKey} />}
          {activeTab === "urlShortener" && <UrlShortener key={resetKey} />}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
