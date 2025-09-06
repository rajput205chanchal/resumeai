import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function AdminResumes() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState({ minScore: "", maxScore: "" });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q.minScore) params.minScore = q.minScore;
      if (q.maxScore) params.maxScore = q.maxScore;
      const { data } = await api.get("/api/resume", { params });
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Resumes</h1>
        <p className="text-gray-600">Manage and review all uploaded resumes</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Resumes</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
            <input
              className="border border-gray-300 p-3 rounded-lg w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="0"
              type="number"
              value={q.minScore}
              onChange={(e) => setQ({ ...q, minScore: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
            <input
              className="border border-gray-300 p-3 rounded-lg w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="100"
              type="number"
              value={q.maxScore}
              onChange={(e) => setQ({ ...q, maxScore: e.target.value })}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "Filtering…" : "Apply Filter"}
          </button>
        </div>
      </div>

      {items === null ? (
        <Spinner label="Loading resumes" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => (
            <Link
              key={r._id}
              to={`/resumes/${r._id}`}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-gray-800">{r.resume_name}</div>
                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Score: {r.score ?? "N/A"}
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <div className="font-medium">{r.user?.name}</div>
                <div>{r.user?.email}</div>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
