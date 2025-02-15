// src/components/dashboard/ProjectsView.tsx

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
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  description?: string;
}

const ProjectsView: React.FC = () => {
  const [viewType, setViewType] = useState("grid");

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              My Projects
            </h2>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              12 active projects
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white border rounded-lg p-1">
              <button
                onClick={() => setViewType("grid")}
                className={`p-1 rounded ${
                  viewType === "grid" ? "bg-gray-100" : ""
                }`}
              >
                <Grid size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-1 rounded ${
                  viewType === "list" ? "bg-gray-100" : ""
                }`}
              >
                <List size={20} className="text-gray-600" />
              </button>
            </div>

            <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50">
              <span>Sort by</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div
          className={`grid ${
            viewType === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          } gap-4`}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card
              key={item}
              className="bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Project {item}</h3>
                  <p className="text-sm text-gray-500">
                    Last edited 2 hours ago
                  </p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Star size={16} className="text-gray-400" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock size={16} />
                <span>Updated 2h ago</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
