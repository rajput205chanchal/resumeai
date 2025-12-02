import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import {
  FiUpload,
  FiLogOut,
  FiLogIn,
  FiList,
  FiUsers,
  FiMenu,
  FiX,
  FiLink,
} from "react-icons/fi";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          ResumeAI
        </Link>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <nav
          className={`${
            isMenuOpen
              ? "absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 flex flex-col gap-3"
              : "hidden md:flex"
          } md:static md:flex items-center md:gap-6`}
        >
          {user && (
            <>
              <NavLink
                to="/upload"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                <FiUpload className="text-sm" /> Upload
              </NavLink>
              <NavLink
                to="/resumes/mine"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                <FiList className="text-sm" /> My Resumes
              </NavLink>
              <NavLink
                to="/resumes/shares"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                <FiLink className="text-sm" /> Share Links
              </NavLink>
              {(user.role === "ADMIN" || user.role === "RECRUITER") && (
                <NavLink
                  to="/admin/resumes"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <FiUsers className="text-sm" /> Admin
                </NavLink>
              )}
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:ml-4 md:pl-4 md:border-l md:border-gray-200 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
                <div className="text-sm text-gray-600">
                  Welcome,{" "}
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                    closeMenu();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors w-full md:w-auto"
                >
                  <FiLogOut className="text-sm" /> Logout
                </button>
              </div>
            </>
          )}
          {!user && (
            <>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`
                }
              >
                <FiLogIn className="text-sm" /> Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors w-full md:w-auto text-center ${
                    isActive ? "bg-blue-700" : ""
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
