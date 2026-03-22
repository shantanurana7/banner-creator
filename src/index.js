import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// === Load custom fonts at runtime (from public/assets/) ===
const fontStyles = document.createElement('style');
fontStyles.textContent = `
  @font-face {
    font-family: 'CondeSansBold';
    src: url('/assets/CondeSans-Bold.otf') format('opentype');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'UniversLTStd';
    src: url('/assets/UniversLTStd.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'UniversLTStdBold';
    src: url('/assets/UniversLTStd-Bold.otf') format('opentype');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
  }
`;
document.head.appendChild(fontStyles);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
