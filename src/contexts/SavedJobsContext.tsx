import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SavedJobsContextType {
  savedJobs: string[];
  addSavedJob: (jobId: string) => void;
  removeSavedJob: (jobId: string) => void;
  isJobSaved: (jobId: string) => boolean;
  toggleBookmark: (jobId: string) => void;
  refreshSavedJobs: () => Promise<void>;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export const useSavedJobsContext = () => {
  const context = useContext(SavedJobsContext);
  if (context === undefined) {
    throw new Error('useSavedJobsContext must be used within a SavedJobsProvider');
  }
  return context;
};

interface SavedJobsProviderProps {
  children: ReactNode;
}

const SAVED_JOBS_BASE_KEY = 'jobquest_saved_jobs';

const getSavedJobsKey = (userId: string | null) => {
  if (!userId) {
    return `${SAVED_JOBS_BASE_KEY}_guest`;
  }
  return `${SAVED_JOBS_BASE_KEY}_${userId}`;
};

export const SavedJobsProvider: React.FC<SavedJobsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get the user-specific localStorage key
  const storageKey = getSavedJobsKey(user?.id || null);

  // Load saved jobs from localStorage on component mount or user change
  useEffect(() => {
    console.log('SavedJobsProvider: Loading saved jobs for user:', user?.id || 'guest');
    console.log('SavedJobsProvider: Using storage key:', storageKey);
    
    try {
      const storedSavedJobs = localStorage.getItem(storageKey);
      console.log('SavedJobsProvider: Raw localStorage value:', storedSavedJobs);
      
      if (storedSavedJobs) {
        const parsedJobs = JSON.parse(storedSavedJobs);
        console.log('SavedJobsProvider: Parsed saved jobs:', parsedJobs);
        
        if (Array.isArray(parsedJobs)) {
          setSavedJobs(parsedJobs);
          console.log('SavedJobsProvider: Successfully loaded', parsedJobs.length, 'saved jobs for user:', user?.id || 'guest');
        } else {
          console.warn('SavedJobsProvider: Parsed data is not an array, initializing with empty array');
          setSavedJobs([]);
        }
      } else {
        console.log('SavedJobsProvider: No saved jobs found for user:', user?.id || 'guest', 'starting with empty array');
        setSavedJobs([]);
      }
    } catch (error) {
      console.error('SavedJobsProvider: Error loading saved jobs from localStorage:', error);
      setSavedJobs([]);
    } finally {
      setIsLoaded(true);
      console.log('SavedJobsProvider: Finished loading saved jobs for user:', user?.id || 'guest');
    }
  }, [user?.id, storageKey]); // Re-run when user changes

  // Save to localStorage whenever savedJobs changes or user changes (but only after initial load)
  useEffect(() => {
    if (!isLoaded) {
      console.log('SavedJobsProvider: Skipping localStorage save - not yet loaded');
      return;
    }
    
    console.log('SavedJobsProvider: Saving to localStorage for user:', user?.id || 'guest', 'jobs:', savedJobs);
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedJobs));
      console.log('SavedJobsProvider: Successfully saved to localStorage with key:', storageKey);
      
      // Verify the save
      const verification = localStorage.getItem(storageKey);
      console.log('SavedJobsProvider: Verification - localStorage now contains:', verification);
    } catch (error) {
      console.error('SavedJobsProvider: Error saving jobs to localStorage:', error);
    }
  }, [savedJobs, isLoaded, storageKey]); // Re-run when user changes

  // Clear saved jobs when user logs out (user becomes null)
  useEffect(() => {
    if (!user && isLoaded) {
      console.log('SavedJobsProvider: User logged out, clearing saved jobs');
      setSavedJobs([]);
    }
  }, [user, isLoaded]);

  const addSavedJob = (jobId: string) => {
    console.log('SavedJobsProvider: addSavedJob called with:', jobId, 'for user:', user?.id || 'guest');
    setSavedJobs(prev => {
      console.log('SavedJobsProvider: Current saved jobs before add:', prev);
      
      if (!prev.includes(jobId)) {
        const newSavedJobs = [...prev, jobId];
        console.log('SavedJobsProvider: Adding job to saved. New list:', newSavedJobs);
        
        // Immediately save to localStorage as backup
        try {
          localStorage.setItem(storageKey, JSON.stringify(newSavedJobs));
          console.log('SavedJobsProvider: Immediate localStorage save successful with key:', storageKey);
        } catch (error) {
          console.error('SavedJobsProvider: Immediate localStorage save failed:', error);
        }
        
        return newSavedJobs;
      } else {
        console.log('SavedJobsProvider: Job already saved, no changes needed');
        return prev;
      }
    });
  };

  const removeSavedJob = (jobId: string) => {
    console.log('SavedJobsProvider: removeSavedJob called with:', jobId, 'for user:', user?.id || 'guest');
    setSavedJobs(prev => {
      console.log('SavedJobsProvider: Current saved jobs before remove:', prev);
      
      const newSavedJobs = prev.filter(id => id !== jobId);
      console.log('SavedJobsProvider: Removing job from saved. New list:', newSavedJobs);
      
      // Immediately save to localStorage as backup
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSavedJobs));
        console.log('SavedJobsProvider: Immediate localStorage save successful with key:', storageKey);
      } catch (error) {
        console.error('SavedJobsProvider: Immediate localStorage save failed:', error);
      }
      
      return newSavedJobs;
    });
  };

  const isJobSaved = (jobId: string): boolean => {
    return savedJobs.includes(jobId);
  };

  const toggleBookmark = (jobId: string) => {
    if (isJobSaved(jobId)) {
      removeSavedJob(jobId);
    } else {
      addSavedJob(jobId);
    }
  };

  const refreshSavedJobs = async () => {
    // Simple refresh from localStorage for now
    console.log('SavedJobsProvider: refreshSavedJobs called for user:', user?.id || 'guest');
    try {
      const storedSavedJobs = localStorage.getItem(storageKey);
      if (storedSavedJobs) {
        const parsedJobs = JSON.parse(storedSavedJobs);
        if (Array.isArray(parsedJobs)) {
          setSavedJobs(parsedJobs);
          console.log('SavedJobsProvider: Successfully refreshed saved jobs for user:', user?.id || 'guest');
        }
      }
    } catch (error) {
      console.error('SavedJobsProvider: Error refreshing saved jobs:', error);
    }
  };

  const value: SavedJobsContextType = {
    savedJobs,
    addSavedJob,
    removeSavedJob,
    isJobSaved,
    toggleBookmark,
    refreshSavedJobs,
  };

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  );
};