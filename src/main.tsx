// src/main.tsx

import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function startApp() {
  try {
    console.log('Starting app...');
    
    // Initialize MSW for both development and production
    console.log('Environment mode:', import.meta.env.DEV ? 'development' : 'production');
    
    try{
      console.log('Initializing MSW...');
      
      // Clear any problematic cookies that might cause MSW to fail (only in development)
      if (import.meta.env.DEV) {
        try {
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        } catch (e) {
          console.warn('Could not clear cookies:', e);
        }
      }
      
      const {worker} = await import('./api/msw/browser');
      await worker.start({
        onUnhandledRequest(request, print) {
          if (request.url.includes('/api/')) {
            print.warning();
            return;
          }
        },
        // Use quiet mode in production to reduce console noise
        quiet: !import.meta.env.DEV,
      });
      
      await sleep(100);
      console.log('MSW started successfully');
    } catch(err){
      console.warn('MSW failed to start:', err);
      // If MSW fails, we can still continue with the app
      console.warn('App will continue without MSW - API calls may fail');
    }

    try {
      console.log('Seeding database...');
      const { seedDB } = await import('./db/seed');
      await seedDB();
      console.log('Database seeded successfully');
    } catch (err) {
      console.error('Seeding failed:', err);
    }
    
    // Load migration tools only in development
    if (import.meta.env.DEV) {
      try {
        await import('./utils/migrateDatabase');
        console.log('Migration tools available in console as migrationTools');
      } catch (err) {
        console.warn('Failed to load migration tools:', err);
      }
    }

    console.log('Rendering React app...');
    const root = createRoot(document.getElementById('root')!);
    root.render(<App />);
    console.log('App started successfully');
  } catch (error) {
    console.error('Failed to start app:', error);
    // Render a simple error message
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h1>App Failed to Start</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Check the console for more details.</p>
      </div>
    `;
  }
}

startApp();
