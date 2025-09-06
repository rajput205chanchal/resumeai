import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { FiFileText } from "react-icons/fi";
import Spinner from "../components/Spinner";

export default function MyResumes() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .get("/api/resume/mine")
      .then((res) => setItems(res.data.data || []))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <Spinner label="Loading resumes" />;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Resumes</h1>
        <p className="text-gray-600">View and manage your uploaded resumes</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <Link
            key={r._id}
            to={`/resumes/${r._id}`}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FiFileText className="text-xl text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{r.resume_name}</div>
                  <div className="text-sm text-gray-500">
                    Score: <span className="font-medium">{r.score ?? "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(r.createdAt).toLocaleString()}
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 text-lg">No resumes yet.</div>
            <div className="text-gray-400 text-sm mt-2">Upload your first resume to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}
