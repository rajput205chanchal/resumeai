const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    resume_name: {
      type: String,
      required: true,
      trim: true,
    },
    job_desc: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number, 
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      trim: true,
    },
    resume_text: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('resume', ResumeSchema);
