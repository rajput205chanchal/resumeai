import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";

export default function ResumeDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [coverForm, setCoverForm] = useState({
    company: "",
    role: "",
    tone: "professional",
    notes: "",
  });

  useEffect(() => {
    api.get(`/api/resume/${id}`).then((res) => setItem(res.data.data));
  }, [id]);

  const createShare = async () => {
    setShareLoading(true);
    try {
      const { data } = await api.post(`/api/resume/${id}/share`, {
        expiresInDays: 7,
      });
      const url = data.data?.url;
      if (url && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Share link created and copied to clipboard");
      } else {
        toast.success("Share link created");
      }
    } catch {
      // error toast handled by interceptor
    } finally {
      setShareLoading(false);
    }
  };

  const generateCover = async () => {
    setCoverLoading(true);
    try {
      const { data } = await api.post(`/api/resume/${id}/cover-letter`, coverForm);
      setCoverLetter(data.data?.coverLetter || "");
    } catch {
      // toast via interceptor
    } finally {
      setCoverLoading(false);
    }
  };

  if (!item) return <Spinner label="Loading resume" />;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {item.resume_name}
          </h1>
          <div className="text-gray-500 text-sm">
            Created {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="text-xl font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            Score: <span className="text-2xl">{item.score ?? "N/A"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={createShare}
              disabled={shareLoading}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              {shareLoading ? "Creating link…" : "Create share link"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-indigo-500 rounded mr-3"></div>
            Cover Letter Assistant
          </h2>
          <form
            className="grid gap-4 md:grid-cols-2 mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              generateCover();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Company (optional)
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. ResumeAI Inc."
                value={coverForm.company}
                onChange={(e) =>
                  setCoverForm((curr) => ({ ...curr, company: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Role / Title (optional)
              </label>
              <input
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Senior Frontend Engineer"
                value={coverForm.role}
                onChange={(e) =>
                  setCoverForm((curr) => ({ ...curr, role: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={coverForm.tone}
                onChange={(e) =>
                  setCoverForm((curr) => ({ ...curr, tone: e.target.value }))
                }
              >
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="confident">Confident</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes for AI (optional)
              </label>
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Mention availability, relocation, or standout achievements"
                value={coverForm.notes}
                onChange={(e) =>
                  setCoverForm((curr) => ({ ...curr, notes: e.target.value }))
                }
              />
            </div>
          </form>
          <button
            onClick={generateCover}
            disabled={coverLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {coverLoading ? "Generating cover letter…" : "Generate cover letter"}
          </button>
          {coverLetter && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-gray-700">
                  Generated Letter
                </div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(coverLetter);
                    toast.success("Cover letter copied");
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Copy
                </button>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {coverLetter}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
            Feedback
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {item.feedback || "No feedback available"}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
            Job Description
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {item.job_desc}
            </p>
          </div>
        </div>

        {item.resume_text && (
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-6 bg-purple-500 rounded mr-3"></div>
              Extracted Resume Text
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {item.resume_text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
