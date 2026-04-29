import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";
import { DashboardPage } from "./Pages";

function PageContent({ activePage }) {
  return (
    <div className="page-content">
      <h2 className="page-content-title">{activePage}</h2>
      <p className="page-content-sub">This section is under construction.</p>
    </div>
  );
}

export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div className="dashboard-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={user} />
      <div className="dashboard-main">
        <Topbar
          activePage={activePage}
          onNavigate={setActivePage}
          user={user}
        />
        <main className="dashboard-content">
          {activePage === "dashboard" ? (
            <DashboardPage onNavigate={setActivePage} />
          ) : (
            <PageContent activePage={activePage} />
          )}
        </main>
      </div>
    </div>
  );
}
