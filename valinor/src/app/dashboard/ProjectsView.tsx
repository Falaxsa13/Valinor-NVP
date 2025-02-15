import React, { useState, useEffect } from "react";
import { useRef } from "react";
import axios from "axios";
import {
  Grid,
  List,
  Filter,
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
  Share2,
  Archive,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: number;
  title: string;
  description?: string;
  collaborators: string[];
  start_date: string;
  deadline: string;
  template: any;
  assignments: Record<string, string>;
  timeline_entries?: Array<{
    section: string;
    subtitle?: string;
    responsible?: string;
    start: string;
    end: string;
  }>;
}

interface ActionMenuProps {
  project: Project;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  project,
  onDelete,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed transform -translate-x-full mt-2 w-48 bg-white rounded-lg shadow-lg 
                   border border-gray-200 py-1 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        href={`/projects/${project.id}/edit`}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Edit2 size={16} className="mr-2" />
        Edit
      </Link>
      <Link
        href={`/projects/${project.id}/timeline`}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Calendar size={16} className="mr-2" />
        Timeline
      </Link>
      <button
        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          // Implement share functionality
        }}
      >
        <Share2 size={16} className="mr-2" />
        Share
      </button>
      <button
        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          // Implement archive functionality
        }}
      >
        <Archive size={16} className="mr-2" />
        Archive
      </button>
      <div className="border-t my-1" />
      <button
        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
      >
        <Trash2 size={16} className="mr-2" />
        Delete
      </button>
    </div>
  );
};

const ProjectCard: React.FC<{
  project: Project;
  viewType: string;
  onDelete: (id: number) => void;
}> = ({ project, viewType, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusInfo = (project: Project) => {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const daysLeft = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysLeft < 0) {
      return {
        label: "Overdue",
        color: "bg-red-50 text-red-700",
        icon: <AlertCircle size={14} className="text-red-500" />,
      };
    } else if (daysLeft <= 7) {
      return {
        label: "Due Soon",
        color: "bg-yellow-50 text-yellow-700",
        icon: <Clock size={14} className="text-yellow-500" />,
      };
    }
    return {
      label: "In Progress",
      color: "bg-blue-50 text-blue-700",
      icon: <CheckCircle size={14} className="text-blue-500" />,
    };
  };

  const status = getStatusInfo(project);
  const progress = project.timeline_entries
    ? (project.timeline_entries.filter(
        (entry) => new Date(entry.end) < new Date()
      ).length /
        project.timeline_entries.length) *
      100
    : 0;

  return (
    <Card
      className={`group bg-white hover:shadow-md transition-all duration-200 ${
        viewType === "list" ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-2">
            <Link href={`/projects/${project.id}`}>
              <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                {project.title}
              </h3>
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 
                         hover:text-gray-600 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {showActions && (
                <ActionMenu
                  project={project}
                  onDelete={() => setShowDeleteDialog(true)}
                  onClose={() => setShowActions(false)}
                />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {project.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
          >
            {status.icon}
            <span>{status.label}</span>
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <Users size={14} className="mr-1" />
            {project.collaborators.length}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Due {new Date(project.deadline).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(project.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewType, setViewType] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/projects");
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    try {
      await axios.delete(`http://localhost:8000/projects/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Projects
            </h2>
            <p className="text-sm text-gray-500">
              {projects.length} active project{projects.length !== 1 && "s"}
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                     bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            New Project
          </Link>
        </div>

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
              <option value="deadline">Deadline</option>
              <option value="name">Name</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>

        <div
          className={`grid ${
            viewType === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          } gap-5`}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewType={viewType}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsView;
