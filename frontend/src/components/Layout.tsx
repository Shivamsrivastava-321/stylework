import { NavLink } from 'react-router-dom';
import { Zap, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="sidebar-logo" style={{ padding: 0, border: 'none' }}>
          <div className="sidebar-logo-icon">⚡</div>
          <div className="sidebar-logo-text" style={{ fontSize: '1rem' }}>
            Style<span>work</span>
          </div>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo hidden-mobile">
          <div className="sidebar-logo-icon">⚡</div>
          <div className="sidebar-logo-text">
            Style<span>work</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard className="nav-link-icon" />
            Lead Dashboard
          </NavLink>

          <NavLink
            to="/webhook-test"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <Zap className="nav-link-icon" />
            Webhook Simulator
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-badge">
            <div className="status-dot" />
            API Connected
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-container animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
