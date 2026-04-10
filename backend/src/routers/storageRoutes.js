const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");

router.post("/start-multipart", storageController.startMultipartUpload);
router.post("/part-url", storageController.getPartPresignedUrl);
router.post("/complete-multipart", storageController.completeMultipartUpload);
router.patch("/confirm-upload/:fileid", storageController.confirmUpload);
router.get("/video/:fileid", storageController.getVideoStatus);
router.get("/videos", storageController.listVideos);
module.exports = router;