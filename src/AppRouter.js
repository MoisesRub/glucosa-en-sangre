// AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import HistoryPage from './HistoryPage';

function AppRouter() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<App />} />
  <Route path="/doctorScreen" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
