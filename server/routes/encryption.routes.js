const express = require("express");
const router = express.Router();
const EncryptionService = require("../services/encryption.service");

const encryptionService = new EncryptionService();

/**
 * @route   POST /api/encryption/encrypt
 * @desc    Encrypt plain data (JSON object or text)
 * @access  Public
 */
router.post("/encrypt", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        statusCode: 400,
        message: "data is required",
        error: "Bad Request",
      });
    }

    let encryptedData;
    let dataType = "text";

    try {
      const jsonData = typeof data === "string" ? JSON.parse(data) : data;
      encryptedData = encryptionService.encryptObject(jsonData);
      dataType = "object";
    } catch (error) {
      const textData = typeof data === "string" ? data : JSON.stringify(data);
      encryptedData = encryptionService.encryptText(textData);
      dataType = "text";
    }

    return res.status(200).json({
      statusCode: 200,
      message: "OK",
      data: encryptedData,
      type: dataType,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: `Failed to encrypt data: ${error.message}`,
      error: "Bad Request",
    });
  }
});

/**
 * @route   POST /api/encryption/decrypt
 * @desc    Decrypt encrypted data
 * @access  Public
 */
router.post("/decrypt", async (req, res) => {
  try {
    let encryptedData = req.body.data || req.body.encryptedData;

    if (!encryptedData) {
      return res.status(400).json({
        statusCode: 400,
        message: "data is required",
        error: "Bad Request",
      });
    }

    encryptedData = String(encryptedData).trim();

    if (!encryptionService.isEncrypted(encryptedData)) {
      return res.status(400).json({
        statusCode: 400,
        message: "The provided data is not encrypted",
        error: "Bad Request",
      });
    }

    try {
      const decryptedObject = encryptionService.decryptObject(encryptedData);
      return res.status(200).json({
        statusCode: 200,
        message: "OK",
        data: decryptedObject,
        type: "object",
      });
    } catch (error) {
      const decryptedText = encryptionService.decryptText(encryptedData);
      return res.status(200).json({
        statusCode: 200,
        message: "OK",
        data: decryptedText,
        type: "text",
      });
    }
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: `Failed to decrypt data: ${error.message}`,
      error: "Bad Request",
    });
  }
});

module.exports = router;
