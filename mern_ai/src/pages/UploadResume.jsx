import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function UploadResume() {
  const [resume_name, setName] = useState("");
  const [job_desc, setJD] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("resume_name", resume_name);
    fd.append("job_desc", job_desc);
    fd.append("file", file);
    setLoading(true);
    try {
      const { data } = await api.post("/api/resume", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Saved. Score: ${data.data?.score ?? "N/A"}`);
      setName("");
      setJD("");
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Resume</h1>
        <p className="text-gray-600">Analyze your resume against a job description</p>
      </div>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter a name for your resume"
            value={resume_name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Paste the job description here"
            value={job_desc}
            onChange={(e) => setJD(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-600 mb-2">
                {file ? file.name : "Click to upload or drag and drop"}
              </div>
              <div className="text-sm text-gray-500">PDF, PNG, JPG up to 10MB</div>
            </label>
          </div>
        </div>
        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? "Analyzing…" : "Analyze Resume"}
        </button>
      </form>
      {loading && <div className="mt-6"><Spinner label="Extracting and scoring" /></div>}
    </div>
  );
}
