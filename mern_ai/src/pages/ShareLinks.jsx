import { useEffect, useState } from "react";
import { FiCopy, FiExternalLink, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../utils/api";
import Spinner from "../components/Spinner";

export default function ShareLinks() {
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/resume/shares");
      setLinks(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const copyLink = async (url) => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const revoke = async (token) => {
    await api.delete(`/api/resume/share/${token}`);
    toast.success("Share link revoked");
    fetchLinks();
  };

  if (links === null && loading) return <Spinner label="Loading share links" />;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Share Links</h1>
          <p className="text-gray-600">
            Manage public links generated for your resumes
          </p>
        </div>
        <button
          onClick={fetchLinks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {links?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No share links yet. Generate one from any resume detail view.
        </div>
      ) : (
        <div className="space-y-4">
          {links?.map((link) => (
            <div
              key={link.token}
              className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-semibold text-gray-800">
                  {link.resume?.resume_name || "Untitled"}
                </div>
                <div className="text-sm text-gray-500">
                  Created {new Date(link.createdAt).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Expires{" "}
                  {link.expiresAt
                    ? new Date(link.expiresAt).toLocaleString()
                    : "Never"}
                </div>
                {link.note && (
                  <div className="text-sm text-gray-600 mt-1">
                    Note: {link.note}
                  </div>
                )}
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 break-all">
                  <FiExternalLink />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {link.url}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(link.url)}
                    className="px-3 py-2 border border-gray-200 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50"
                  >
                    <FiCopy /> Copy
                  </button>
                  <button
                    onClick={() => revoke(link.token)}
                    className="px-3 py-2 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm hover:bg-red-50"
                  >
                    <FiTrash2 /> Revoke
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

