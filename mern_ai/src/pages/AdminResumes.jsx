import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

export default function AdminResumes() {
  const [items, setItems] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    keywords: "",
    minScore: "",
    maxScore: "",
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async (override = {}) => {
    setLoading(true);
    try {
      const params = {};
      Object.entries({ ...filters, ...override }).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const { data } = await api.get("/api/resume", { params });
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const initialFilters = {
      q: "",
      keywords: "",
      minScore: "",
      maxScore: "",
      fromDate: "",
      toDate: "",
    };
    setFilters(initialFilters);
    fetchData(initialFilters);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Resumes</h1>
        <p className="text-gray-600">Manage and review all uploaded resumes</p>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Resumes
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Search (top row, left) */}
            <div className="lg:col-span-7">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search
              </label>
              <input
                id="search"
                className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Name, feedback, text…"
                value={filters.q}
                onChange={(e) =>
                  setFilters((curr) => ({ ...curr, q: e.target.value }))
                }
              />
            </div>

            {/* Score Range (top row, right) */}
            <div className="lg:col-span-5">
              <label
                htmlFor="minScore"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Score Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="minScore"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Min"
                  type="number"
                  value={filters.minScore}
                  onChange={(e) =>
                    setFilters((curr) => ({
                      ...curr,
                      minScore: e.target.value,
                    }))
                  }
                />
                <span className="text-gray-500">-</span>
                <input
                  aria-label="Maximum Score"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Max"
                  type="number"
                  value={filters.maxScore}
                  onChange={(e) =>
                    setFilters((curr) => ({
                      ...curr,
                      maxScore: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Date Range (second row, left) */}
            <div className="lg:col-span-7">
            
              <div className="flex items-center gap-2">
                <input
                  id="fromDate"
                  type="date"
                  className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((curr) => ({
                      ...curr,
                      fromDate: e.target.value,
                    }))
                  }
                />
                <span className="text-gray-500">-</span>
                <input
                  aria-label="To Date"
                  type="date"
                  className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((curr) => ({ ...curr, toDate: e.target.value }))
                  }
                />
              </div>
            </div>
            {/* Actions (second row, right) */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 items-stretch mt-2 md:mt-0">
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 w-full sm:w-auto"
                disabled={loading}
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Filtering…" : "Apply Filter"}
              </button>
            </div>
          </div>
        </form>
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
                <div className="font-semibold text-gray-800">
                  {r.resume_name}
                </div>
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
