import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './useAuth';

interface SavedJobsHook {
  savedJobs: string[];
  isSaved: (jobId: string) => boolean;
  saveJob: (jobId: string) => Promise<void>;
  unsaveJob: (jobId: string) => Promise<void>;
  refreshSavedJobs: () => Promise<void>;
}

export const useSavedJobs = (): SavedJobsHook => {
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const authContext = useContext(AuthContext);

  // Ensure context is available
  if (!authContext) {
    console.warn('useSavedJobs: AuthContext not available, returning default values');
    return {
      savedJobs: [],
      isSaved: () => false,
      saveJob: async () => console.warn('Save job called but user not authenticated'),
      unsaveJob: async () => console.warn('Unsave job called but user not authenticated'),
      refreshSavedJobs: async () => console.warn('Refresh saved jobs called but user not authenticated')
    };
  }

  const { user } = authContext;

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('jobquest_token');
      const response = await fetch('/api/users/saved-jobs', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.savedJobs || []);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const isSaved = (jobId: string): boolean => {
    return savedJobs.includes(jobId);
  };

  const saveJob = async (jobId: string): Promise<void> => {
    console.log('saveJob called for:', jobId, 'user:', !!user);
    if (!user) {
      console.warn('No user logged in, cannot save job');
      return;
    }

    try {
      const token = localStorage.getItem('jobquest_token');
      console.log('Token exists:', !!token);
      console.log('Making request to:', `/api/users/save-job/${jobId}`);
      
      const response = await fetch(`/api/users/save-job/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      console.log('Save job response status:', response.status);
      console.log('Save job response ok:', response.ok);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Save job response data:', responseData);
        
        setSavedJobs(prev => {
          const newSaved = [...prev, jobId];
          console.log('Updated saved jobs:', newSaved);
          return newSaved;
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to save job:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const unsaveJob = async (jobId: string): Promise<void> => {
    if (!user) return;

    try {
      const token = localStorage.getItem('jobquest_token');
      const response = await fetch(`/api/users/unsave-job/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const refreshSavedJobs = async (): Promise<void> => {
    await fetchSavedJobs();
  };

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  return {
    savedJobs,
    isSaved,
    saveJob,
    unsaveJob,
    refreshSavedJobs
  };
};
