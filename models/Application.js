const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  general: {
    name: String,
    dob: String,
    age: String,
    fatherName: String,
    contact: String,
    category: String,
    gender: String,
    nationality: String,
    email: String,
    address: String,
    permanentAddress: String,
  },
  education: [
    {
      examination: String,
      passingYear: String,
      course: String,
      duration: String,
      subjects: String,
      percentage: String,
      boardName: String,
      document: String,
    },
  ],
  experience: [
    {
      organization: String,
      designation: String,
      from: String,
      to: String,
    },
  ],
  achievements: [
    {
      title: String,
      document: String,
    },
  ],
  postApplied: String,
  optionalDocs: [String],
  declaration: String,
  signature: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", ApplicationSchema);
