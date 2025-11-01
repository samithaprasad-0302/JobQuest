import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SavedJobsProps {
  darkMode: boolean;
}

const SavedJobsMinimal: React.FC<SavedJobsProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  
  console.log('SavedJobsMinimal rendering with darkMode:', darkMode);

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-4">Minimal Saved Jobs Page</h1>
      <p className="mb-4">This is a minimal version to test rendering.</p>
      <button 
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Back
      </button>
      <div className="mt-4">
        <p>Dark mode: {darkMode ? 'Yes' : 'No'}</p>
        <p>Console should show this component is rendering.</p>
      </div>
    </div>
  );
};

export default SavedJobsMinimal;