import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";
import { DashboardPage } from "./Pages";
import ExperimentsPage from "./ExperimentsPage";
import AIInsightsPage from "./AIInsightsPage";
import ResultsPage from "./ResultsPage";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";

function PageContent({ activePage }) {
  return (
    <div className="page-content">
      <h2 className="page-content-title">{activePage}</h2>
      <p className="page-content-sub">This section is under construction.</p>
    </div>
  );
}

export default function Dashboard({ user: initialUser }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(initialUser);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={setActivePage} />;
      case "experiments":
        return <ExperimentsPage />;
      case "ai":
        return <AIInsightsPage user={user} />;
      case "results":
        return <ResultsPage />;
      case "profile":
        return (
          <ProfilePage
            user={user}
            onUserUpdate={(updated) => setUser(updated)}
          />
        );
      case "settings":
        return <SettingsPage />;
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
        <main className="dashboard-content">{renderPage()}</main>
      </div>
    </div>
  );
}
