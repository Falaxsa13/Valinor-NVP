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
  Plus,
  Grid,
  List,
  ChevronDown,
  Clock,
  Star,
  Folder,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import ProjectsView from "./ProjectsView";
import CalendarView from "./CalendarView";

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-white">
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MenuIcon size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-medium text-gray-800">Dashboard</h1>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
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
      <div className="p-8"></div>

      <div className="flex-1 px-3">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === "projects"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === "calendar"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar size={20} />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => (window.location.href = "/editor")}
            className="flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FileText size={20} />
            <span>Editor</span>
          </button>
        </div>

        <div className="mt-6">
          <h3 className="px-4 mb-2 text-xs font-medium text-gray-500 uppercase">
            Recent Projects
          </h3>
          <div className="space-y-1">
            {["Marketing Campaign", "Website Redesign", "Mobile App"].map(
              (project) => (
                <button
                  key={project}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Folder size={20} className="text-gray-400" />
                  <span>{project}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t">
        <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <HelpCircle size={20} />
          <span>Help & Support</span>
        </button>
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
        {renderView()}
      </div>
    </div>
  );
};

export default Dashboard;
