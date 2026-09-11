import { LayoutDashboard, ShieldCheck, BarChart2, Sparkles, Settings, HelpCircle, Database, LineChart } from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, onOpenSettings, onOpenHelp, filename }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'visualize', label: 'Visualizations', icon: LineChart },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'statistics', label: 'Statistics', icon: BarChart2 },
    { id: 'eda', label: 'EDA', icon: Sparkles },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-wrap">
          <img src="/prism-logo.png" alt="PRISM Logo" className="sidebar-logo-img" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">PRISM</span>
          <span className="sidebar-brand-tagline">Reveal your data</span>
        </div>
      </div>

      {filename && (
        <div className="sidebar-dataset-badge">
          <Database size={13} />
          <span className="sidebar-dataset-name" title={filename}>{filename}</span>
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section-title">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="sidebar-nav-item-icon">
                <Icon size={18} />
              </div>
              <span className="sidebar-nav-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onOpenSettings} className="sidebar-footer-item">
          <Settings size={17} />
          <span>Settings</span>
        </button>
        <button onClick={onOpenHelp} className="sidebar-footer-item">
          <HelpCircle size={17} />
          <span>Help & Docs</span>
        </button>
      </div>
    </aside>
  );
}
