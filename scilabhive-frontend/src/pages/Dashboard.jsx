import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";
import { DashboardPage } from "./Pages";
import ExperimentsPage from "./ExperimentsPage";
import AIInsightsPage from "./AIInsightsPage";
import ResultsPage from "./ResultsPage";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import AnalyticsPage from "./AnalyticsPage";
import CollaboratePage from "./CollaboratePage";
import { getExperiments, getMyCollaborators, getMe } from "../services/api";

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
  const [experimentCount, setExperimentCount] = useState(0);
  const [collaboratorCount, setCollaboratorCount] = useState(0);

  // Fetch fresh user data on mount — fixes stale avatar/profile data

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // Fetch sidebar badge counts — refetch whenever the active page changes

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [exps, collabs] = await Promise.all([
          getExperiments(),
          getMyCollaborators(),
        ]);
        setExperimentCount(exps.length);
        setCollaboratorCount(
          collabs.filter((c) => c.status === "active" || c.status === "pending")
            .length,
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchCounts();
  }, [activePage]);

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

      case "analytics":
        return <AnalyticsPage />;

      case "collaborate":
        return <CollaboratePage />;

      default:
        return <PageContent activePage={activePage} />;
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        experimentCount={experimentCount}
        collaboratorCount={collaboratorCount}
      />
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
