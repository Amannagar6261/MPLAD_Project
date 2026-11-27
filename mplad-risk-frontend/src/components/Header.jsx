function Header() {
  return (
    <header className="app-header">

      <div className="header-left">

        <div className="header-logo">
          M
        </div>

        <div className="header-title-section">
          <h1>
            MPLAD Project Intelligence
          </h1>

          <p>
            AI-Assisted Project Monitoring & Anomaly Detection
          </p>
        </div>

      </div>

      <div className="header-right">

        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <strong>System Online</strong>
            <span>Monitoring active</span>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Header;