const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"]
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+()\-\s]{7,20}$/, "Please enter a valid phone number"]
    },
    jobRole: { type: String, required: true, trim: true, maxlength: 100 },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (items) => items.length > 0 && items.every((item) => item.trim()),
        message: "At least one skill is required"
      }
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Interview", "Rejected"],
      default: "Applied"
    }
  },
  { timestamps: true }
);

// Prevent the same candidate from applying twice for the same role.
applicationSchema.index({ email: 1, jobRole: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
