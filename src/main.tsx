import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' 
// Hapus import BrowserRouter dari sini jika ada

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* HAPUS <BrowserRouter> DI SINI KARENA SUDAH ADA DI App.tsx */}
    <App />
  </React.StrictMode>,
)