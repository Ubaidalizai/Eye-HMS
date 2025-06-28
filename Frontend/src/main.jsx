// Assuming this is your main entry file
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import the axios instance to make it available globally
import api from './api-interceptor';

// Make axios available globally for the interceptor in AuthContext
window.axios = api;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
