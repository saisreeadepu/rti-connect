import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="layout">
      {!isAuthPage && <Navbar />}
      <main className={`main-content ${isAuthPage ? 'auth-page' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default Layout;