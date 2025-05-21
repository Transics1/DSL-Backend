const express = require("express");
const router = express.Router();
const {
  submitApplication,
  getMyApplication,
  downloadPDF,
} = require("../controllers/applicationController");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    fields: 50, 
    files: 20, 
    parts: 100, 
  },
});

const fileFields = [
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "educationDoc_0", maxCount: 1 },
  { name: "educationDoc_1", maxCount: 1 },
  { name: "educationDoc_2", maxCount: 1 },
  { name: "achievementDoc_0", maxCount: 1 },
  { name: "achievementDoc_1", maxCount: 1 },
  { name: "achievementDoc_2", maxCount: 1 },
  { name: "optionalDoc_0", maxCount: 1 },
  { name: "optionalDoc_1", maxCount: 1 },
  { name: "optionalDoc_2", maxCount: 1 },
];

router.post(
  "/submit",
  authMiddleware,
  upload.fields(fileFields),
  submitApplication
);

router.get("/me", authMiddleware, getMyApplication);

router.get("/pdf/:id", authMiddleware, downloadPDF);

module.exports = router;
