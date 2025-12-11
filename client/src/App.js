import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Encryption from "./components/encryption";
import Formatter from "./components/formatter";
import Converter from "./components/converter";

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
        </div>
        <button className="clear-all-btn" onClick={handleClearAll}>
          Clear All
        </button>
      </nav>

      <div className="main-content">
        <div
          className={`container ${
            activeTab === "json" || activeTab === "converter"
              ? "full-width"
              : ""
          }`}
        >
          {activeTab === "encryption" && <Encryption key={resetKey} />}
          {activeTab === "json" && <Formatter key={resetKey} />}
          {activeTab === "converter" && <Converter key={resetKey} />}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
