import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";
import { DashboardPage } from "./Pages";
import ExperimentsPage from "./ExperimentsPage"; // ← add this

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

  const renderPage = () => {
    // ← add this function
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={setActivePage} />;
      case "experiments":
        return <ExperimentsPage />;
      default:
        return <PageContent activePage={activePage} />;
    }
  };

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
          {renderPage()} {/* ← replace the ternary with this */}
        </main>
      </div>
    </div>
  );
}
