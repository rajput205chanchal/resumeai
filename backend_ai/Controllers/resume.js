const ResumeModel = require('../Models/resume');
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");
const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // 🔑 Paste your API key here
});




exports.addResume = async (req, res) => {
    try {
        const { job_desc, user } = req.body;
        console.log(req.file)
        const pdfBuffer = req.file.buffer || null;
        {/* Please watch the video for ful source code */ }

        const prompt = `
            You are a resume screening assistant.
            Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

            Resume:
            ${pdfData.text}

            Job Description:
            ${job_desc}

            Return the score and a brief explanation in this format:
            Score: XX
            Reason: ...

            `
            ;
        const response = await cohere.generate({
            model: "command",
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.7,
        });

        let result = response.generations[0].text;
        // console.log(result)

        {/* Please watch the video for ful source code */ }

        await newResume.save();

        fs.unlinkSync(pdfPath); // remove temp file

        res.status(200).json({ message: "Your analysis are ready", data: newResume });



    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}



exports.getAllResumesForUser = async (req, res) => {
    try {
        {/* Please watch the video for ful source code */ }


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getResumeForAdmin = async (req, res) => {
    try {
        {/* Please watch the video for ful source code */ }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', message: err.message });
    }
}