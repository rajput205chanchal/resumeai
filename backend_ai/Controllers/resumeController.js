const crypto = require("crypto");
const pdfParse = require("pdf-parse");
const { CohereClient } = require("cohere-ai");
const Resume = require("../Models/resume");
const SharedResume = require("../Models/sharedResume");

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

    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: 'PDF file is required under field "file"' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = (pdfData.text || "").slice(0, 20000); // keep prompt safe

    // Check for existing latest resume to version
    const latestResume = await Resume.findOne({
      user: ownerId,
      resume_name,
      isLatest: true,
    });

    let version = 1;
    let parentResume = null;

    if (latestResume) {
      version = latestResume.version + 1;
      parentResume = latestResume._id;
      // Mark previous latest as not latest
      latestResume.isLatest = false;
      await latestResume.save();
    }

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

    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 160,
      temperature: 0.3,
    });

    const raw = response.text || "";
    const { score, feedback } = parseCohereResult(raw);

    const newResume = await Resume.create({
      user: ownerId,
      resume_name,
      job_desc,
      score,
      feedback,
      resume_text: resumeText,
      version,
      parentResume,
      isLatest: true,
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

function buildShareUrl(token) {
  const base =
    process.env.SHARE_BASE_URL ||
    process.env.FRONTEND_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:5173";
  return `${base.replace(/\/$/, "")}/share/${token}`;
}

function keywordFilter(keywords) {
  if (!keywords) return null;
  const parts = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  return parts.map((word) => {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return {
      $or: [{ resume_text: regex }, { job_desc: regex }, { feedback: regex }],
    };
  });
}

exports.getAllResumesForUser = async (req, res) => {
  try {
    const { q, keywords, fromDate, toDate, minScore, maxScore } = req.query;
    const filter = { user: req.user._id };

    if (q) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { resume_name: regex },
        { job_desc: regex },
        { feedback: regex },
      ];
    }

    const keywordClauses = keywordFilter(keywords);
    if (keywordClauses) {
      filter.$and = [...(filter.$and || []), ...keywordClauses];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    if (minScore || maxScore) {
      filter.score = {};
      if (minScore) filter.score.$gte = Number(minScore);
      if (maxScore) filter.score.$lte = Number(maxScore);
    }

    const resumes = await Resume.find(filter).sort({ createdAt: -1 });
    res.json({ count: resumes.length, data: resumes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getResumesForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      user,
      minScore,
      maxScore,
      q,
      keywords,
      fromDate,
      toDate,
    } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (minScore)
      filter.score = { ...(filter.score || {}), $gte: Number(minScore) };
    if (maxScore)
      filter.score = { ...(filter.score || {}), $lte: Number(maxScore) };

    if (q) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { resume_name: regex },
        { job_desc: regex },
        { feedback: regex },
        { resume_text: regex },
      ];
    }

    const keywordClauses = keywordFilter(keywords);
    if (keywordClauses) {
      filter.$and = [...(filter.$and || []), ...keywordClauses];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const [items, total] = await Promise.all([
      Resume.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      Resume.countDocuments(filter),
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

exports.getResumeVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    // ownership check for candidates
    if (
      req.user.role === "CANDIDATE" &&
      String(resume.user._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Find all versions of this resume
    const versions = await Resume.find({
      $or: [{ _id: id }, { parentResume: id }, { _id: resume.parentResume }],
      user: resume.user,
    }).sort({ version: 1 });

    res.json({ data: versions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.compareResumes = async (req, res) => {
  try {
    const { ids } = req.body; // array of resume IDs
    if (!ids || ids.length < 2) {
      return res
        .status(400)
        .json({ error: "At least two resume IDs required" });
    }

    const resumes = await Resume.find({ _id: { $in: ids } }).populate(
      "user",
      "name email role"
    );

    // ownership check for candidates
    for (const resume of resumes) {
      if (
        req.user.role === "CANDIDATE" &&
        String(resume.user._id) !== String(req.user._id)
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    res.json({ data: resumes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.createShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiresInDays = 7, allowDownload = false, note = "" } = req.body;

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    if (
      req.user.role === "CANDIDATE" &&
      String(resume.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const token = crypto.randomBytes(18).toString("hex");
    const expiresAt =
      expiresInDays && Number(expiresInDays) > 0
        ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000)
        : null;

    const link = await SharedResume.create({
      token,
      resume: resume._id,
      owner: req.user._id,
      expiresAt,
      allowDownload,
      note,
    });

    res.json({
      data: {
        token: link.token,
        url: buildShareUrl(link.token),
        expiresAt: link.expiresAt,
        allowDownload: link.allowDownload,
        note: link.note,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.listShareLinks = async (req, res) => {
  try {
    const links = await SharedResume.find({ owner: req.user._id })
      .populate("resume", "resume_name score createdAt")
      .sort({ createdAt: -1 });

    res.json({
      count: links.length,
      data: links.map((link) => ({
        _id: link._id,
        token: link.token,
        resume: link.resume,
        expiresAt: link.expiresAt,
        allowDownload: link.allowDownload,
        note: link.note,
        createdAt: link.createdAt,
        url: buildShareUrl(link.token),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.revokeShareLink = async (req, res) => {
  try {
    const { token } = req.params;
    const deleted = await SharedResume.findOneAndDelete({
      token,
      owner: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Share link not found" });
    }
    res.json({ message: "Share link revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getSharedResume = async (req, res) => {
  try {
    const { token } = req.params;
    const link = await SharedResume.findOne({ token }).populate({
      path: "resume",
      populate: { path: "user", select: "name email role" },
    });
    if (!link) return res.status(404).json({ error: "Share link not found" });

    if (link.expiresAt && link.expiresAt < new Date()) {
      await link.deleteOne().catch(() => {});
      return res.status(410).json({ error: "Share link expired" });
    }

    res.json({
      data: {
        resume: link.resume,
        allowDownload: link.allowDownload,
        note: link.note,
        sharedAt: link.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    if (
      req.user.role === "CANDIDATE" &&
      String(resume.user) !== String(req.user._id)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      company = "",
      role = "",
      tone = "professional",
      notes = "",
    } = req.body || {};

    const prompt = `
You are an expert career coach and copywriter.
Write a concise, ${tone} cover letter tailored to the following job description, resume, and optional context.

CONTEXT (optional):
- Company: ${company || "Not specified"}
- Role: ${role || "Not specified"}
- Recruiter notes: ${notes || "None"}

Requirements:
- 3–5 short paragraphs
- Friendly but formal tone unless otherwise stated
- Highlight the strongest, most relevant experience pulled from the resume text
- Do NOT invent companies or roles that are not present in the resume text
- Use "I" voice, and keep it under 350 words
- Add a closing sentence that invites next steps

JOB DESCRIPTION:
${resume.job_desc}

RESUME TEXT:
${(resume.resume_text || "").slice(0, 4000)}
`.trim();

    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: prompt,
      max_tokens: 320,
      temperature: 0.55,
    });

    const text = response.text?.trim();
    if (!text) {
      return res
        .status(502)
        .json({ error: "AI did not return a cover letter. Please try again." });
    }

    res.json({ data: { coverLetter: text } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};
