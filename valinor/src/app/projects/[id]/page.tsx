"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RoadmapComponent from "@/components/RoadmapComponent";
import KanbanBoardComponent from "@/components/KanbanBoardComponent";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Clock4,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  BarChart,
  Calendar,
  Users,
} from "lucide-react";

// Import the API methods instead of axios
import { getProject, getProjectMetrics } from "@/api/api";

interface Project {
  id: string;
  title: string;
  // if no status is provided by the API, we'll default to "In Progress"
  status?: string;
  timeline: any[];
  // Other properties if needed...
}

interface ProjectMetrics {
  team: {
    total_members: number;
    active_members: number;
    team_members: any[];
    roles_distribution: Record<string, number>;
  };
  phases: {
    total_phases: number;
    completed_phases: number;
    in_progress_phases: number;
    upcoming_phases: number;
    completion_percentage: number;
    phase_distribution: {
      completed: number;
      in_progress: number;
      upcoming: number;
    };
  };
  last_updated: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    "In Progress": {
      color: "bg-blue-50 text-blue-600",
      icon: <Clock4 className="w-4 h-4 mr-1" />,
    },
    Completed: {
      color: "bg-green-50 text-green-600",
      icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
    },
    "On Hold": {
      color: "bg-yellow-50 text-yellow-600",
      icon: <AlertCircle className="w-4 h-4 mr-1" />,
    },
  };

  const variant = variants[status] || variants["In Progress"];

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${variant.color}`}
    >
      {variant.icon}
      {status}
    </span>
  );
};

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Call the new API methods in parallel
        const [projectData, metricsData] = await Promise.all([
          getProject(Number(id)),
          getProjectMetrics(Number(id)),
        ]);

        setProject(projectData);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const MetricCard = ({ icon: Icon, title, value, progress }: any) => (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
      </div>
      {progress && <Progress value={progress} className="h-1.5 mt-3" />}
    </div>
  );

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 h-14">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-gray-300" />
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {project.title}
              </h1>
              <StatusBadge status={project.status || "In Progress"} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              icon={BarChart}
              title="Completion"
              value={`${metrics?.phases.completion_percentage || 0}%`}
            />
            <MetricCard
              icon={Calendar}
              title="Phases"
              value={`${metrics?.phases.total_phases || 0} Total`}
            />
            <MetricCard
              icon={Users}
              title="Team Members"
              value={`${metrics?.team.active_members || 0} Active`}
            />
            <MetricCard
              icon={Brain}
              title="Phase Distribution"
              value={`${metrics?.phases.completed_phases || 0} Complete`}
            />
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white border rounded-lg">
            <div className="border-b flex">
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "roadmap"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setActiveTab("kanban")}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "kanban"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Kanban Board
              </button>
            </div>

            <div className="p-6">
              {activeTab === "roadmap" && (
                <RoadmapComponent timeline={project.timeline || []} />
              )}
              {activeTab === "kanban" && <KanbanBoardComponent />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailsPage;
