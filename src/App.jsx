import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';
import LockPage from './pages/Lock.jsx';
import UnlockPage from './pages/Unlock.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/lock" replace />} />
        <Route path="/lock" element={<LockPage />} />
        <Route path="/unlock" element={<UnlockPage />} />
      </Routes>
    </Layout>
  );
}
