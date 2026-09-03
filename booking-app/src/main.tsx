import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// https://dev.to/edriso/how-to-use-react-query-with-react-router-loaders-pre-fetch-cache-data-kag
