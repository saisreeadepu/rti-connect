import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const sizeClass = `loader-${size}`;
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader ${sizeClass}`}>
          <div className="loader-spinner"></div>
          <div className="loader-text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className={`loader ${sizeClass}`}>
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
};

export default Loader;