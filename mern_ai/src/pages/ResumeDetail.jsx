import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Spinner from "../components/Spinner";

export default function ResumeDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    api.get(`/api/resume/${id}`).then((res) => setItem(res.data.data));
  }, [id]);

  if (!item) return <Spinner label="Loading resume" />;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{item.resume_name}</h1>
          <div className="text-gray-500 text-sm">
            Created {new Date(item.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="text-xl font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
          Score: <span className="text-2xl">{item.score ?? "N/A"}</span>
        </div>
      </div>

      <div className="space-y-8">
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
