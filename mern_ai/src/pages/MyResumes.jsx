import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FiFileText } from "react-icons/fi";
import Spinner from "../components/Spinner";

export default function MyResumes() {
  const [items, setItems] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    keywords: "",
    minScore: "",
    maxScore: "",
    fromDate: "",
    toDate: "",
  });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (paramsOverride = {}) => {
    setLoading(true);
    const params = {};
    Object.entries({ ...filters, ...paramsOverride }).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    try {
      const { data } = await api.get("/api/resume/mine", { params });
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
  }, []);

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const startCompare = () => {
    if (selected.length < 2) return;
    navigate(`/resumes/compare?ids=${selected.join(",")}`);
  };

  if (items === null) return <Spinner label="Loading resumes" />;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Resumes</h1>
        <p className="text-gray-600">View and manage your uploaded resumes</p>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Filter Resumes
          </h2>
        </div>
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

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {selected.length} selected
        </div>
        <button
          disabled={selected.length < 2}
          onClick={startCompare}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compare {selected.length > 0 ? `(${selected.length})` : ""}
        </button>
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
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              <label
                className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(r._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelected(r._id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4"
                />
                Compare
              </label>
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
