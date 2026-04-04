const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");

router.post("/generate-upload-url", storageController.getUploadUrl);

module.exports = router;