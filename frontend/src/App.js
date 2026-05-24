


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Chatbot from './components/Chatbot';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackRequest from './pages/TrackRequest';
import About from './pages/About';
import Scoreboard from './pages/Scoreboard';
import TransparencyDashboard from './pages/TransparencyDashboard';

// Citizen Pages
import Dashboard from './pages/Dashboard';
import SubmitRTI from './pages/SubmitRTI';
import MyRequests from './pages/MyRequests';
import RequestDetails from './pages/RequestDetails';
import Profile from './pages/Profile';

// PIO Pages
import PIODashboard from './pages/PIODashboard';
import PIORequests from './pages/PIORequests';
import PIORequestDetails from './pages/PIORequestDetails';

// Appellate Pages
import AppealDashboard from './pages/AppealDashboard';
import AppealDetails from './pages/AppealDetails';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDepartments from './pages/AdminDepartments';
import Analytics from './pages/Analytics';
import SystemSettings from './pages/SystemSettings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track/:requestId" element={<TrackRequest />} />
            <Route path="/transparency" element={<TransparencyDashboard />} />

            {/* Citizen Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/submit-rti" element={
              <PrivateRoute>
                <SubmitRTI />
              </PrivateRoute>
            } />
            <Route path="/my-requests" element={
              <PrivateRoute>
                <MyRequests />
              </PrivateRoute>
            } />
            <Route path="/request/:requestId" element={
              <PrivateRoute>
                <RequestDetails />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            {/* PIO Routes */}
            <Route path="/pio-dashboard" element={
              <PrivateRoute role="pio">
                <PIODashboard />
              </PrivateRoute>
            } />
            <Route path="/pio-requests" element={
              <PrivateRoute role="pio">
                <PIORequests />
              </PrivateRoute>
            } />
            <Route path="/pio-request/:requestId" element={
              <PrivateRoute role="pio">
                <PIORequestDetails />
              </PrivateRoute>
            } />

            {/* Appellate Routes */}
            <Route path="/appeal-dashboard" element={
              <PrivateRoute role="appellate">
                <AppealDashboard />
              </PrivateRoute>
            } />
            <Route path="/appeal/:requestId" element={
              <PrivateRoute role="appellate">
                <AppealDetails />
              </PrivateRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/users" element={
              <PrivateRoute role="admin">
                <AdminUsers />
              </PrivateRoute>
            } />
            <Route path="/admin/departments" element={
              <PrivateRoute role="admin">
                <AdminDepartments />
              </PrivateRoute>
            } />
            <Route path="/admin/analytics" element={
              <PrivateRoute role="admin">
                <Analytics />
              </PrivateRoute>
            } />
            <Route path="/admin/settings" element={
              <PrivateRoute role="admin">
                <SystemSettings />
              </PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        <Chatbot />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;