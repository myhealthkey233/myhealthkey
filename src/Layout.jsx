import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function IconShield() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Draw two rectangles to form a bold hospital cross, sized to fill the rounded square */}
      <rect x="26" y="14" width="12" height="36" rx="2" fill="#fff" />
      <rect x="14" y="26" width="36" height="12" rx="2" fill="#fff" />
    </svg>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-root">
      <header className="header">
        <div className="header-inner">
          <Link to="/lock" className="logo">
            <div className="logo-icon">
              <div className="shield-bg">
                <IconShield />
              </div>
            </div>
            <div className="logo-text">
              <div className="brand">MyHealthKey</div>
              <div className="tag">Ghana Health Data Protection</div>
            </div>
          </Link>

          <nav className="nav-desktop">
            <Link to="/lock" className={"nav-link " + (isActive('/lock') ? 'active' : '')}>Lock PDF</Link>
            <Link to="/unlock" className={"nav-link " + (isActive('/unlock') ? 'active' : '')}>Unlock PDF</Link>
          </nav>

          <div className="mobile-toggle">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="menu-btn">☰</button>
          </div>
        </div>
        {mobileOpen && (
          <div className="mobile-menu">
            <Link onClick={() => setMobileOpen(false)} to="/lock" className="mobile-link">Lock PDF</Link>
            <Link onClick={() => setMobileOpen(false)} to="/unlock" className="mobile-link">Unlock PDF</Link>
          </div>
        )}
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-left">
          <div className="footer-line">© 2025 MyHealthKey. Protecting patient privacy in Ghana.</div>
        </div>

        <div className="footer-right">
          <span className="shield-small" aria-hidden>🔒</span>
          <span className="footer-text">End-to-end encrypted • Zero-knowledge security</span>
        </div>
      </footer>
    </div>
  );
}
