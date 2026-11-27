import { NavLink } from "react-router-dom";

function Sidebar() {
  const navigationItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: "⌂"
    },
    {
      label: "Projects",
      path: "/projects",
      icon: "▦"
    },
    {
      label: "Risk Analysis",
      path: "/risk-analysis",
      icon: "◈"
    },
    {
      label: "Comparison",
      path: "/comparison",
      icon: "⇄"
    },
    {
      label: "Reports",
      path: "/reports",
      icon: "▤"
    }
  ];

  return (
    <aside className="app-sidebar">

      <div className="sidebar-brand">

        <div className="sidebar-brand-icon">
          M
        </div>

        <div>
          <h2>MPLAD</h2>
          <span>Project Intelligence</span>
        </div>

      </div>

      <nav className="sidebar-navigation">

        <p className="navigation-heading">
          WORKSPACE
        </p>

        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive
                ? "navigation-link active"
                : "navigation-link"
            }
          >
            <span className="navigation-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-bottom">

        <div className="sidebar-ai-card">

          <div className="sidebar-ai-icon">
            ✦
          </div>

          <div>
            <strong>AI Intelligence</strong>
            <span>
              Anomaly analysis enabled
            </span>
          </div>

        </div>

        <div className="sidebar-version">
          MPLAD Intelligence
          <span>Project Monitoring System</span>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;