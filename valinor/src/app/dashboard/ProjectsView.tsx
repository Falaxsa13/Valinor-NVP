import React, { useState } from "react";
import {
  Grid,
  List,
  ChevronDown,
  Star,
  Clock,
  Users,
  Plus,
  MoreVertical,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  description?: string;
  lastEdited: string;
  members: number;
  progress: number;
  status: "In Progress" | "Completed" | "On Hold";
}

const sampleProjects: Project[] = [
  {
    id: 1,
    title: "Marketing Campaign 2025",
    description: "Q1 Marketing initiatives and campaign planning",
    lastEdited: "2h ago",
    members: 5,
    progress: 68,
    status: "In Progress",
  },
  {
    id: 2,
    title: "Product Launch",
    description: "New feature release and marketing coordination",
    lastEdited: "5h ago",
    members: 8,
    progress: 92,
    status: "Completed",
  },
  // Add more sample projects as needed
];

const ProjectCard = ({
  project,
  viewType,
}: {
  project: Project;
  viewType: string;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-50 text-blue-700";
      case "Completed":
        return "bg-green-50 text-green-700";
      case "On Hold":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <Card
      className={`group bg-white hover:shadow-md transition-all duration-200 ${
        viewType === "list" ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
              {project.title}
            </h3>
            <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Users size={14} className="mr-1" />
            {project.members}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>{project.lastEdited}</span>
        </div>
      </div>

      <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${project.progress}%` }}
        />
      </div>
    </Card>
  );
};

const ProjectsView: React.FC = () => {
  const [viewType, setViewType] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Projects
            </h2>
            <p className="text-sm text-gray-500">
              You have 12 active projects and 3 completed this month
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                     bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            New Project
          </Link>
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                           border border-transparent hover:border-gray-200 rounded-lg hover:bg-white 
                           transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Filter
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border rounded-lg p-1">
              <button
                onClick={() => setViewType("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewType === "grid"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewType === "list"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <select
              className="px-3 py-1.5 text-sm text-gray-600 bg-white border rounded-lg 
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       cursor-pointer appearance-none pr-8"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: "right 8px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "16px",
              }}
            >
              <option value="recent">Last modified</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div
          className={`grid ${
            viewType === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          } gap-5`}
        >
          {sampleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewType={viewType}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
