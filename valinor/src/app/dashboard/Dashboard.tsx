import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Search,
  Bell,
  Menu as MenuIcon,
  Folder,
} from "lucide-react";
import ProjectsView from "./ProjectsView";
import CalendarView from "./CalendarView";

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-white">
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MenuIcon size={20} className="text-gray-600" />
        </button>
        <div className="h-6 w-px bg-gray-200" />
        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search in Dashboard"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                     text-sm placeholder-gray-500 outline-none
                     focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                     transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="h-8 w-px bg-gray-200" />
        <button
          className="w-9 h-9 rounded-full bg-blue-600 text-white font-medium 
                        flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          A
        </button>
      </div>
    </header>
  );
};

interface SideNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SideNav: React.FC<SideNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="w-64 bg-white border-r h-full flex flex-col">
      <div className="flex-1 py-6">
        <div className="px-3 space-y-0.5">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors
                       ${
                         activeTab === "projects"
                           ? "bg-blue-50 text-blue-600 font-medium"
                           : "text-gray-700 hover:bg-gray-50"
                       }`}
          >
            <LayoutDashboard size={18} className="mr-3" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors
                       ${
                         activeTab === "calendar"
                           ? "bg-blue-50 text-blue-600 font-medium"
                           : "text-gray-700 hover:bg-gray-50"
                       }`}
          >
            <Calendar size={18} className="mr-3" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => (window.location.href = "/editor")}
            className="flex items-center w-full px-4 py-2.5 text-sm rounded-lg 
                     text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText size={18} className="mr-3" />
            <span>Editor</span>
          </button>
        </div>

        <div className="mt-8 px-3">
          <h3 className="px-4 mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Recent Projects
          </h3>
          <div className="space-y-0.5">
            {["Marketing Campaign", "Product launch"].map((project) => (
              <button
                key={project}
                className="flex items-center w-full px-4 py-2.5 text-sm rounded-lg 
                           text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Folder size={18} className="mr-3 text-gray-400" />
                <span>{project}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t">
        <div className="space-y-0.5">
          <button
            className="flex items-center w-full px-4 py-2.5 text-sm rounded-lg 
                         text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} className="mr-3" />
            <span>Settings</span>
          </button>
          <button
            className="flex items-center w-full px-4 py-2.5 text-sm rounded-lg 
                         text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle size={18} className="mr-3" />
            <span>Help & Support</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");

  const renderView = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarView />;
      case "projects":
      default:
        return <ProjectsView />;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto bg-gray-50">{renderView()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
