const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");

router.post("/generate-upload-url", storageController.getUploadUrl);
router.patch("/confirm-upload/:fileId", storageController.confirmUpload);

module.exports = router;