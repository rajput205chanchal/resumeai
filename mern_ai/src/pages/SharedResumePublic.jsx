import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import api from "../utils/api";

export default function SharedResumePublic() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/resume/shared/${token}`)
      .then((res) => setData(res.data.data))
      .catch((err) => {
        const msg = err.response?.data?.error || "Unable to load shared resume";
        setError(msg);
      });
  }, [token]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
        <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>
        <p className="text-gray-600">
          The link may have expired or was revoked by the owner.
        </p>
      </div>
    );
  }

  if (!data) return <Spinner label="Loading shared resume" />;

  const { resume, allowDownload, note, sharedAt } = data;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
      <div>
        <div className="text-sm text-gray-500">Shared on {new Date(sharedAt).toLocaleString()}</div>
        <h1 className="text-3xl font-bold text-gray-800 mt-1 mb-3">
          {resume.resume_name}
        </h1>
        <div className="text-gray-600">
          Courtesy of {resume.user?.name} ({resume.user?.email})
        </div>
      </div>

      {note && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-700 text-sm">
          {note}
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
          Score: <span className="font-semibold text-gray-800">{resume.score ?? "N/A"}</span>
        </div>
        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
          Version {resume.version || 1}
        </div>
        <div
          className={`px-4 py-2 rounded-lg border ${
            allowDownload
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-yellow-50 border-yellow-100 text-yellow-700"
          }`}
        >
          {allowDownload ? "Owner permitted downloads" : "Download disabled by owner"}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Feedback</h2>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
          {resume.feedback || "No feedback available"}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Job Description</h2>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
          {resume.job_desc}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Extracted Resume Text</h2>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {resume.resume_text}
        </div>
      </section>
    </div>
  );
}

