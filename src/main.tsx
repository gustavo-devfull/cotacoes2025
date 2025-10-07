import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard';
import { UserProvider } from './contexts/UserContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <Dashboard />
    </UserProvider>
  </React.StrictMode>,
);
