import React from 'react';
import { Activity } from 'lucide-react';


export default function Header({ isBackendOnline, checkingHealth }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-icon-wrapper">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="logo-title">EmotionAI</h1>
          </div>
        </div>

        <div className={`status-badge ${isBackendOnline ? 'online' : 'offline'}`}>
          <span className={`status-dot ${isBackendOnline ? 'online' : 'offline'}`}></span>
          {checkingHealth ? (
            <span>Connecting...</span>
          ) : isBackendOnline ? (
            <span>Model Online</span>
          ) : (
            <span>Backend Offline</span>
          )}
        </div>
      </div>
    </header>
  );
}
