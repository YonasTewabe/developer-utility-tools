const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

const encryptionRoutes = require("./routes/encryption.routes");
app.use("/api/encryption", encryptionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
