// Google OAuth configuration and utilities
export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: '689779050619-cup7rq13o4ovf47blooo2bralcvaq0ia.apps.googleusercontent.com',
  // For Google Identity Services, no redirect URI is needed
  SCOPE: 'openid email profile'
};

// Load Google OAuth script
export const loadGoogleOAuthScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
    document.head.appendChild(script);
  });
};

// Initialize Google OAuth
export const initializeGoogleOAuth = async () => {
  await loadGoogleOAuthScript();
  
  if (window.google && window.google.accounts) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
      callback: () => {}, // Will be set dynamically
    });
  }
};

// Real Google OAuth sign-in with popup
export const signInWithGooglePopup = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('Starting Google OAuth...');
    
    loadGoogleOAuthScript().then(() => {
      console.log('Google script loaded successfully');
      
      if (!window.google || !window.google.accounts) {
        console.error('Google OAuth not available after script load');
        reject(new Error('Google OAuth not loaded'));
        return;
      }

      console.log('Initializing Google OAuth token client...');
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
        scope: GOOGLE_OAUTH_CONFIG.SCOPE,
        callback: (response: any) => {
          console.log('Google OAuth response:', response);
          
          if (response.error) {
            console.error('Google OAuth error:', response.error);
            reject(new Error(`Google OAuth error: ${response.error}`));
            return;
          }
          
          if (response.access_token) {
            console.log('Got access token, fetching user info...');
            // Get user info using the access token
            fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
              .then(res => {
                console.log('User info response status:', res.status);
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
              })
              .then(userInfo => {
                console.log('Google user info received:', userInfo);
                resolve(userInfo);
              })
              .catch(error => {
                console.error('Error fetching user info:', error);
                reject(error);
              });
          } else {
            console.error('No access token received');
            reject(new Error('Failed to get access token'));
          }
        },
      });
      
      console.log('Requesting access token...');
      // Request access token - this will show the Google account selection popup
      tokenClient.requestAccessToken();
    }).catch(error => {
      console.error('Error loading Google script:', error);
      reject(error);
    });
  });
};

// Type definitions for Google OAuth
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}