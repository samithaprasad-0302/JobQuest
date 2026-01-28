// Base URL used for API and assets
// If VITE_API_URL is provided and ends with "/api", strip it for asset URLs to avoid
// building URLs like http://localhost:5000/api/uploads/...
const RAW_BASE = import.meta.env.VITE_API_URL || 'https://jobquest-backend-36x6.onrender.com';
export const API_BASE_URL = RAW_BASE; // for consistency if used elsewhere
const ASSET_BASE_URL = RAW_BASE.replace(/\/$/, '').replace(/\/api$/, '');

export const getResumeUrl = (filename: string) => {
  if (!filename) return null;

  if (/^https?:\/\//i.test(filename)) {
    return filename; // no cache-busting needed for downloads
  }

  // Handle both old format (full path) and new format (filename only)
  if (filename.includes('uploads\\resumes\\') || filename.includes('uploads/resumes/')) {
    const cleanPath = filename.replace(/\\/g, '/');
    return `${ASSET_BASE_URL}/${cleanPath.replace(/^\//, '')}`;
  }
  return `${ASSET_BASE_URL}/uploads/resumes/${filename}`;
};