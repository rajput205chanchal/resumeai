const mongoose = require("mongoose");

const SharedResumeSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "resume",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    allowDownload: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

SharedResumeSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $ne: null } },
  }
);

module.exports = mongoose.model("shared_resume", SharedResumeSchema);

