export default function LeftPanel() {
  return (
    <div className="left-panel">
      <h3>🚨 SOS</h3>
      <p>📍 You are Safe</p>
      <p>⚠ 2 alerts nearby</p>

      <div className="panel-box">
        <h4>Quick Actions</h4>
        <button>Share Location</button>
        <button>Report Incident</button>
      </div>
    </div>
  );
}