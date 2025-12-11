import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Encryption from "./components/encryption";
import Formatter from "./components/formatter";
import Converter from "./components/converter";
import DiffChecker from "./components/diffChecker";

function App() {
  const [activeTab, setActiveTab] = useState("encryption");
  const [resetKey, setResetKey] = useState(0);

  const handleClearAll = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="App">
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
        </div>
        <button className="clear-all-btn" onClick={handleClearAll}>
          Clear All
        </button>
      </nav>

      <div className="main-content">
        <div
          className={`container ${
            activeTab === "encryption" ||
            activeTab === "json" ||
            activeTab === "converter" ||
            activeTab === "diffChecker"
              ? "full-width"
              : ""
          }`}
        >
          {activeTab === "encryption" && <Encryption key={resetKey} />}
          {activeTab === "json" && <Formatter key={resetKey} />}
          {activeTab === "converter" && <Converter key={resetKey} />}
          {activeTab === "diffChecker" && <DiffChecker key={resetKey} />}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
