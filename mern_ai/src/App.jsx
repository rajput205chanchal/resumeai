import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UploadResume from './pages/UploadResume.jsx';
import MyResumes from './pages/MyResumes.jsx';
import AdminResumes from './pages/AdminResumes.jsx';
import ResumeDetail from './pages/ResumeDetail.jsx';
import ShareLinks from './pages/ShareLinks.jsx';
import CompareResumes from './pages/CompareResumes.jsx';
import SharedResumePublic from './pages/SharedResumePublic.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleGuard from './components/RoleGuard.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/resumes/mine" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share/:token" element={<SharedResumePublic />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<UploadResume />} />
            <Route path="/resumes/mine" element={<MyResumes />} />
            <Route path="/resumes/:id" element={<ResumeDetail />} />
            <Route path="/resumes/compare" element={<CompareResumes />} />
            <Route path="/resumes/shares" element={<ShareLinks />} />

            <Route element={<RoleGuard roles={['ADMIN','RECRUITER']} />}>
              <Route path="/admin/resumes" element={<AdminResumes />} />
            </Route>
          </Route>

          <Route path="*" element={<div className="p-8">Not found</div>} />
        </Routes>
      </div>
    </div>
  );
}
