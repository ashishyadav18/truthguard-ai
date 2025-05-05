import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';
import { AuthProvider } from './context/AuthContext';

// Get the root element
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Render the app with AuthProvider
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);