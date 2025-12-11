import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Encryption from "./components/encryption";
import Formatter from "./components/formatter";
import Converter from "./components/converter";

function App() {
  const [activeTab, setActiveTab] = useState("encryption");

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔐 Encryption Decryption Tool</h1>
      </header>
      <nav className="sub-header">
        <div className="tab-navigation">
          <button
            className={`tab ${activeTab === "encryption" ? "active" : ""}`}
            onClick={() => setActiveTab("encryption")}
          >
            🔒 Encryption/Decryption
          </button>
          <button
            className={`tab ${activeTab === "json" ? "active" : ""}`}
            onClick={() => setActiveTab("json")}
          >
            📝 JSON Formatter
          </button>
          <button
            className={`tab ${activeTab === "converter" ? "active" : ""}`}
            onClick={() => setActiveTab("converter")}
          >
            🔄 File Format Converter
          </button>
        </div>
      </nav>

      <div
        className={`container ${
          activeTab === "json" || activeTab === "converter" ? "full-width" : ""
        }`}
      >
        {activeTab === "encryption" && <Encryption />}
        {activeTab === "json" && <Formatter />}
        {activeTab === "converter" && <Converter />}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
