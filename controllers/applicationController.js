const Application = require("../models/Application");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.submitApplication = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        success: false,
        error: "No files were uploaded",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: "User authentication required",
      });
    }

    console.log("Authenticated user:", req.user); 

    const files = req.files;

    if (
      !req.body.general ||
      !req.body.education ||
      !req.body.experience ||
      !req.body.achievements ||
      !req.body.postApplied
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required form data",
      });
    }

    let general, education, experience, achievements, optionalDocs;

    try {
      general = JSON.parse(req.body.general);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid general data format" });
    }

    try {
      education = JSON.parse(req.body.education);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid education data format" });
    }

    try {
      experience = JSON.parse(req.body.experience);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid experience data format" });
    }

    try {
      achievements = JSON.parse(req.body.achievements);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid achievements data format" });
    }

    try {
      optionalDocs = req.body.optionalDocs
        ? JSON.parse(req.body.optionalDocs)
        : [];
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid optional documents format" });
    }

    const postApplied = req.body.postApplied;
    const declaration =
      req.body.declarationChecked === "true" ? "Checked" : "Unchecked";
    const signature = files.signature?.[0]?.path || null;

    if (files.photo) {
      general.photo = files.photo[0].path;
    }
    if (files.signature) {
      general.signature = files.signature[0].path;
    }

    Object.keys(files).forEach((key) => {
      if (key.startsWith("educationDoc_")) {
        const idx = parseInt(key.split("_")[1]);
        if (education[idx]) education[idx].document = files[key][0].path;
      }
    });

    Object.keys(files).forEach((key) => {
      if (key.startsWith("achievementDoc_")) {
        const idx = parseInt(key.split("_")[1]);
        if (achievements[idx]) achievements[idx].document = files[key][0].path;
      }
    });

    let optionalDocsPaths = [];
    Object.keys(files).forEach((key) => {
      if (key.startsWith("optionalDoc_")) {
        const idx = parseInt(key.split("_")[1]);
        if (optionalDocs[idx]) optionalDocs[idx].document = files[key][0].path;
        optionalDocsPaths[idx] = files[key][0].path;
      }
    });

    const application = new Application({
      user: req.user._id, 
      general,
      education,
      experience,
      achievements,
      postApplied,
      optionalDocs: optionalDocsPaths.filter(Boolean),
      declaration,
      signature: general.signature || signature,
    });

    console.log("Saving application with user:", application.user);

    await application.save();
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application._id,
    });
  } catch (err) {
    console.error("Application submission error:", err);
    res
      .status(500)
      .json({ success: false, error: "Submission failed: " + err.message });
  }
};

exports.getMyApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ user: req.user.id });
    if (!application) {
      return res.status(404).json({ error: "No application found" });
    }
    res.json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).send("Application not found");

    const doc = new PDFDocument();
    const filePath = path.join(
      __dirname,
      `../../uploads/application_${app._id}.pdf`
    );
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(16).text("Application Form", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("General Details");
    doc.fontSize(12);
    Object.entries(app.general).forEach(([key, value]) => {
      if (key !== "photo") {
        doc.text(`${key}: ${value}`);
      }
    });
    doc.text(`Photo: ${app.general.photo || "Not provided"}`);
    doc.moveDown();

    doc.fontSize(14).text("Education");
    app.education.forEach((edu) => {
      doc.fontSize(12);
      Object.entries(edu).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.fontSize(14).text("Experience");
    app.experience.forEach((exp) => {
      doc.fontSize(12);
      Object.entries(exp).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.fontSize(14).text("Achievements");
    app.achievements.forEach((ach) => {
      doc.fontSize(12);
      Object.entries(ach).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.fontSize(14).text("Declaration");
    doc.fontSize(12).text(app.declaration);
    doc.text(`Signature: ${app.signature || "Not provided"}`);

    doc.end();

    doc.on("finish", () => {
      res.download(filePath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};
