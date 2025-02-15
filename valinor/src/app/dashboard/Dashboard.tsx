// src/components/dashboard/Dashboard.tsx

import React, { useState } from "react";
import ProjectsView from "./ProjectsView";
import CalendarView from "./CalendarView";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div className="flex h-screen">
      {/* Left Vertical Menu */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <button
          onClick={() => setActiveTab("projects")}
          className={`mb-4 px-4 py-2 text-left rounded hover:bg-gray-700 transition-colors ${
            activeTab === "projects" ? "bg-gray-700" : ""
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`mb-4 px-4 py-2 text-left rounded hover:bg-gray-700 transition-colors ${
            activeTab === "calendar" ? "bg-gray-700" : ""
          }`}
        >
          Calendar
        </button>

        <button
          onClick={() => (window.location.href = "/editor")}
          className={`px-4 py-2 text-left rounded hover:bg-gray-700 transition-colors`}
        >
          Editor
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        {activeTab === "projects" ? <ProjectsView /> : <CalendarView />}
      </div>
    </div>
  );
};

export default Dashboard;
