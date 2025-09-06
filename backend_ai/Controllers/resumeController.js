const Resume = require("../Models/resume");
const pdfParse = require("pdf-parse");
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

function parseCohereResult(text) {
  let score = undefined;
  let feedback = text?.trim() || "";

  const scoreMatch = feedback.match(/score\s*:\s*(\d{1,3})/i);
  if (scoreMatch) {
    const n = Number(scoreMatch[1]);
    if (!Number.isNaN(n)) score = Math.max(0, Math.min(100, n));
  }
  const reasonMatch = feedback.match(/reason\s*:\s*([\s\S]+)/i);
  if (reasonMatch) {
    feedback = reasonMatch[1].trim();
  }
  return { score, feedback: feedback || text };
}

exports.addResume = async (req, res) => {
  try {
    // candidate can only upload for themselves; recruiters/admins may optionally specify user
    const { job_desc, resume_name } = req.body;
    const ownerId =
      req.user.role === "CANDIDATE"
        ? req.user._id
        : req.body.user || req.user._id;

    // console.log(req.file);

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: 'PDF file is required under field "file"' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = (pdfData.text || "").slice(0, 20000); // keep prompt safe

    const prompt = `
You are a resume screening assistant.
Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

Resume:
${resumeText}

Job Description:
${job_desc}

Return in exactly this format:
Score: XX
Reason: <brief explanation>
`.trim();

    const response = await cohere.generate({
      model: "command",
      prompt,
      max_tokens: 160,
      temperature: 0.3,
    });

    const raw = response.generations?.[0]?.text || "";
    const { score, feedback } = parseCohereResult(raw);

    const newResume = await Resume.create({
      user: ownerId,
      resume_name,
      job_desc,
      score,
      feedback,
      resume_text: resumeText,
    });

    res.status(200).json({
      message: "Your analysis is ready",
      data: newResume,
      ai_raw: raw, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getAllResumesForUser = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ count: resumes.length, data: resumes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getResumesForAdmin = async (req, res) => {
  try {
    // For ADMIN/RECRUITER: filter, paginate
    const { page = 1, limit = 20, user, minScore, maxScore } = req.query;
    const q = {};
    if (user) q.user = user;
    if (minScore) q.score = { ...(q.score || {}), $gte: Number(minScore) };
    if (maxScore) q.score = { ...(q.score || {}), $lte: Number(maxScore) };

    const [items, total] = await Promise.all([
      Resume.find(q)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Resume.countDocuments(q),
    ]);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate(
      "user",
      "name email role"
    );
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    // ownership check for candidates
    if (
      req.user.role === "CANDIDATE" &&
      String(resume.user._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ data: resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};
