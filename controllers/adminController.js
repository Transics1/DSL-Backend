const Application = require("../models/Application");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

exports.getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find().populate("user");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const applications = await Application.find();
    const fields = [
      "general.name",
      "general.email",
      "postApplied",
      "general.category",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(applications);

    res.header("Content-Type", "text/csv");
    res.attachment("applications.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: "Failed to export CSV" });
  }
};

exports.generateApplicationPDF = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=application_${req.params.id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(16).text("Application Details", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("General Information");
    doc.fontSize(12);
    doc.text(`Name: ${application.general.name}`);
    doc.text(`Email: ${application.general.email}`);
    doc.text(`Date of Birth: ${application.general.dob}`);
    doc.text(`Contact: ${application.general.contact}`);
    doc.text(`Category: ${application.general.category}`);
    doc.text(`Gender: ${application.general.gender}`);
    doc.text(`Nationality: ${application.general.nationality}`);
    doc.text(`Address: ${application.general.address}`);
    doc.moveDown();

    doc.fontSize(14).text("Education Details");
    doc.fontSize(12);
    application.education.forEach((edu) => {
      doc.text(`${edu.examination}:`);
      doc.text(`Course: ${edu.course}`);
      doc.text(`Passing Year: ${edu.passingYear}`);
      doc.text(`Duration: ${edu.duration}`);
      doc.text(`Subjects: ${edu.subjects}`);
      doc.text(`Percentage: ${edu.percentage}%`);
      doc.text(`Board: ${edu.boardName}`);
      doc.moveDown();
    });

    if (application.experience.length > 0) {
      doc.fontSize(14).text("Experience Details");
      doc.fontSize(12);
      application.experience.forEach((exp) => {
        doc.text(`Organization: ${exp.organization}`);
        doc.text(`Designation: ${exp.designation}`);
        doc.text(`From: ${exp.from}`);
        doc.text(`To: ${exp.to}`);
        doc.moveDown();
      });
    }

    if (application.achievements.length > 0) {
      doc.fontSize(14).text("Achievements");
      doc.fontSize(12);
      application.achievements.forEach((ach) => {
        doc.text(`Title: ${ach.title}`);
        doc.moveDown();
      });
    }

    doc.fontSize(14).text("Post Applied For");
    doc.fontSize(12);
    doc.text(application.postApplied);
    doc.moveDown();

    doc.fontSize(14).text("Declaration");
    doc.fontSize(12);
    doc.text(
      "I hereby declare that all the information provided above is true to my knowledge."
    );
    doc.moveDown();

    doc.end();
    res.on("finish", () => {
      console.log("PDF sent");
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Error generating PDF" });
  }
};
