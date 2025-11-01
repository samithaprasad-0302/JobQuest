import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import JobCarousel from './components/JobCarousel';
import JobCategories from './components/JobCategories';
import CareerAdvice from './components/CareerAdvice';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import CreateProfileModal from './components/CreateProfileModal';
import MyProfile from './components/MyProfile';
import SignupModal from './components/SignupModal';
import SignInModal from './components/SignInModal';
import AdminLayout from './components/AdminLayout';
import JobDetails from './components/JobDetails';
import SearchResults from './components/SearchResults';
import SavedJobs from './components/SavedJobsReal';
import AllJobs from './components/AllJobs';
import CategoriesPage from './components/CategoriesPage';
import MyApplications from './components/MyApplications';
import { SavedJobsProvider } from './contexts/SavedJobsContext';
import cookieService from './services/cookieService';

// Home Page Component
const HomePage = ({ 
  darkMode, 
  toggleDarkMode,
  onCreateProfile,
  onMyProfile,
  onSignUp,
  onSignIn,
  showCreateProfile,
  setShowCreateProfile,
  showMyProfile,
  setShowMyProfile,
  showSignup,
  setShowSignup,
  showSignIn,
  setShowSignIn
}: any) => (
  <>
    <Navigation 
      darkMode={darkMode} 
      toggleDarkMode={toggleDarkMode}
      onCreateProfile={onCreateProfile}
      onMyProfile={onMyProfile}
      onSignUp={onSignUp}
      onSignIn={onSignIn}
    />
    
    <Hero darkMode={darkMode} />
    <SearchBar darkMode={darkMode} />
    
    <main>
      <JobCarousel darkMode={darkMode} />
      <JobCategories darkMode={darkMode} />
      {/* <FeaturedEmployers darkMode={darkMode} /> */}
      <CareerAdvice darkMode={darkMode} />
    </main>

    <Footer darkMode={darkMode} />
    <ChatWidget darkMode={darkMode} />
    
    {showCreateProfile && (
      <CreateProfileModal 
        onClose={() => setShowCreateProfile(false)}
        darkMode={darkMode}
      />
    )}
    
    {showMyProfile && (
      <MyProfile 
        onClose={() => setShowMyProfile(false)}
        darkMode={darkMode}
      />
    )}
    
    {showSignup && (
      <SignupModal 
        onClose={() => setShowSignup(false)}
        darkMode={darkMode}
        onSwitchToSignIn={() => {
          setShowSignup(false);
          setShowSignIn(true);
        }}
      />
    )}
    
    {showSignIn && (
      <SignInModal 
        onClose={() => setShowSignIn(false)}
        darkMode={darkMode}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignup(true);
        }}
      />
    )}
  </>
);

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from cookies
    const saved = cookieService.getCookie('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    // Save to cookies
    cookieService.setCookie('darkMode', JSON.stringify(newMode), {
      maxAge: 365 * 24 * 60 * 60 // 1 year
    });
  };

  // Listen for custom event to open signup modal from guest application
  useEffect(() => {
    const handleOpenSignupModal = () => {
      setShowSignup(true);
    };

    window.addEventListener('openSignupModal', handleOpenSignupModal);
    
    return () => {
      window.removeEventListener('openSignupModal', handleOpenSignupModal);
    };
  }, []);

  return (
    <SavedJobsProvider>
      <Router>
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
          <Routes>
            <Route path="/" element={
              <HomePage 
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onCreateProfile={() => setShowCreateProfile(true)}
                onMyProfile={() => setShowMyProfile(true)}
                onSignUp={() => setShowSignup(true)}
                onSignIn={() => setShowSignIn(true)}
                showCreateProfile={showCreateProfile}
                setShowCreateProfile={setShowCreateProfile}
                showMyProfile={showMyProfile}
                setShowMyProfile={setShowMyProfile}
                showSignup={showSignup}
                setShowSignup={setShowSignup}
                showSignIn={showSignIn}
                setShowSignIn={setShowSignIn}
              />
            } />
            <Route path="/search" element={
              <SearchResults darkMode={darkMode} />
            } />
            <Route path="/all-jobs" element={
              <AllJobs darkMode={darkMode} />
            } />
            <Route path="/saved-jobs" element={
              <SavedJobs darkMode={darkMode} />
            } />
            <Route path="/my-applications" element={
              <MyApplications darkMode={darkMode} />
            } />
            <Route path="/categories" element={
              <CategoriesPage darkMode={darkMode} />
            } />
            <Route path="/job/:id" element={
              <JobDetails darkMode={darkMode} />
            } />
            <Route path="/contact" element={
              <>
                <Navigation 
                  darkMode={darkMode} 
                  toggleDarkMode={toggleDarkMode}
                  onCreateProfile={() => setShowCreateProfile(true)}
                  onMyProfile={() => setShowMyProfile(true)}
                  onSignUp={() => setShowSignup(true)}
                  onSignIn={() => setShowSignIn(true)}
                />
                <ContactUs darkMode={darkMode} />
                <Footer darkMode={darkMode} />
              </>
            } />
            <Route path="/admin/*" element={
              <AdminLayout 
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            } />
          </Routes>
        </div>
      </Router>
    </SavedJobsProvider>
  );
}

export default App;