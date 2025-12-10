// API Configuration
// In Dev (Vite), '' uses the proxy in vite.config.js
// In Prod (Static Serve), we need to point to the backend explicitly
export const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:5001');



