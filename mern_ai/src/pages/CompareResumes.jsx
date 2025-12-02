import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiBarChart2 } from "react-icons/fi";
import api from "../utils/api";
import Spinner from "../components/Spinner";

const colorPalette = ["bg-blue-50", "bg-green-50", "bg-purple-50"];

function tokenize(text = "") {
  return text
    .toLowerCase()
    .split(/[\s,.;:()\-]+/)
    .filter((token) => token.length > 3);
}

function getKeywordStats(resume) {
  const resumeTokens = tokenize(resume.resume_text);
  const jdTokens = tokenize(resume.job_desc);
  const uniqueResume = new Set(resumeTokens);
  const uniqueJD = new Set(jdTokens);

  const overlap = [...uniqueJD].filter((token) => uniqueResume.has(token));

  return {
    coverage: uniqueJD.size ? Math.round((overlap.length / uniqueJD.size) * 100) : 0,
    missingKeywords: [...uniqueJD].filter((token) => !uniqueResume.has(token)).slice(0, 10),
    standoutKeywords: [...uniqueResume].filter((token) => !uniqueJD.has(token)).slice(0, 10),
  };
}

export default function CompareResumes() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const ids = useMemo(() => {
    return (searchParams.get("ids") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }, [searchParams]);

  useEffect(() => {
    if (ids.length < 2) {
      setError("Select at least two resumes to compare.");
      return;
    }
    api
      .post("/api/resume/compare", { ids })
      .then((res) => setItems(res.data.data || []))
      .catch(() => setError("Unable to load resumes for comparison."));
  }, [ids]);

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <FiAlertTriangle /> <span>{error}</span>
        </div>
        <button
          onClick={() => navigate("/resumes/mine")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <FiArrowLeft /> Go back
        </button>
      </div>
    );
  }

  if (!items) {
    return <Spinner label="Building comparison" />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-600 font-semibold">
          <FiBarChart2 /> Resume Comparison
        </div>
        <p className="text-gray-600">
          Side-by-side view of selected resumes, including keyword coverage insights.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((resume, idx) => {
          const stats = getKeywordStats(resume);
          return (
            <div
              key={resume._id}
              className={`p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 ${colorPalette[idx % colorPalette.length]}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-500">
                    Version {resume.version || 1}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    {resume.resume_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Score: <span className="font-semibold">{resume.score ?? "N/A"}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  Keyword Coverage
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-600"
                    style={{ width: `${stats.coverage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.coverage}% of JD keywords are present.
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  Missing Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.missingKeywords.length === 0 ? (
                    <span className="text-xs text-green-600">None 🎉</span>
                  ) : (
                    stats.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded-full"
                      >
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  Standout Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.standoutKeywords.length === 0 ? (
                    <span className="text-xs text-gray-500">No unique highlights yet.</span>
                  ) : (
                    stats.standoutKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs bg-white border border-green-200 text-green-600 px-2 py-1 rounded-full"
                      >
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

