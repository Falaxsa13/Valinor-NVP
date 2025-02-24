import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProjects } from "@/api/api";
import {
  Grid,
  List,
  Search,
  Filter as FilterIcon,
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
  Star,
  ChevronDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: number;
  title: string;
  description?: string;
  template: string;
  collaborators: string[];
  start_date: string;
  deadline: string;
  timeline: Array<{
    section: string;
    subtitle?: string;
    responsible_email?: string;
    start: string;
    end: string;
  }>;
}

interface ProjectStatus {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const ProjectCard: React.FC<{
  project: Project;
  viewType: string;
  onDelete: (id: number) => void;
}> = ({ project, viewType, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusInfo = (): ProjectStatus => {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const daysLeft = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysLeft < 0) {
      return {
        label: "Overdue",
        color: "text-red-700",
        bgColor: "bg-red-50",
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
      };
    } else if (daysLeft <= 7) {
      return {
        label: "Due Soon",
        color: "text-amber-700",
        bgColor: "bg-amber-50",
        icon: <Clock className="h-4 w-4 text-amber-600" />,
      };
    }
    return {
      label: "In Progress",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
    };
  };

  const status = getStatusInfo();
  const progress =
    project.timeline.length > 0
      ? (project.timeline.filter((entry) => new Date(entry.end) < new Date())
          .length /
          project.timeline.length) *
        100
      : 0;

  const formattedDate = new Date(project.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Display only the first 3 collaborators and show +X for the rest
  const displayedCollaborators = project.collaborators.slice(0, 3);
  const extraCollaborators = project.collaborators.length - 3;

  return (
    <Card className="overflow-hidden transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-md relative group">
      {Math.random() > 0.7 && (
        <div className="absolute top-0 right-0">
          <span className="inline-block w-0 h-0 border-t-[24px] border-t-blue-600 border-l-[24px] border-l-transparent"></span>
          <Star className="absolute top-0.5 right-0.5 h-3 w-3 text-white" />
        </div>
      )}
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`} className="group">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.title}
            </h3>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={`/projects/${project.id}/edit`}>
                <DropdownMenuItem>
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              </Link>
              <Link href={`/projects/${project.id}/timeline`}>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Timeline</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project "{project.title}" and
                  all of its data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => onDelete(project.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {project.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`${status.bgColor} ${status.color} flex gap-1 items-center px-2 py-1`}
            >
              {status.icon}
              <span>{status.label}</span>
            </Badge>
            <span className="text-xs text-gray-500">Due {formattedDate}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-gray-100 mt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex -space-x-2">
            {displayedCollaborators.map((collaborator, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-7 w-7 border-2 border-white">
                      <AvatarImage
                        src={`/api/placeholder/32/32?text=${getInitials(
                          collaborator
                        )}`}
                      />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        {getInitials(collaborator)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{collaborator}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {extraCollaborators > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-7 w-7 border-2 border-white bg-gray-100">
                      <AvatarFallback className="text-xs text-gray-600 bg-gray-100">
                        +{extraCollaborators}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    {extraCollaborators} more collaborator
                    {extraCollaborators > 1 ? "s" : ""}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
              {new Date(project.start_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 text-gray-400" />
              <span className="text-xs text-gray-500">
                {project.collaborators.length}
              </span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewType, setViewType] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderPinned, setIsHeaderPinned] = useState(false);

  useEffect(() => {
    fetchProjects();

    const handleScroll = () => {
      setIsHeaderPinned(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await getProjects();
      setProjects(response.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    // Implement delete functionality
    console.log(`Deleting project ${id}`);
  };

  const filteredProjects = projects
    .filter((project) => {
      // Status filter
      if (filterStatus === "all") return true;

      const now = new Date();
      const deadline = new Date(project.deadline);
      const daysLeft = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)
      );

      switch (filterStatus) {
        case "overdue":
          return daysLeft < 0;
        case "due-soon":
          return daysLeft >= 0 && daysLeft <= 7;
        case "in-progress":
          return daysLeft > 7;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sorting
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
          );
        case "deadline":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50 dark:bg-gray-900">
      <div
        className={`sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 transition-shadow duration-200 ${
          isHeaderPinned ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-4 pb-2">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Projects
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and track all your projects in one place
              </p>
            </div>

            <Link href="/projects/new">
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-2">
        {/* Section intentionally removed - now in sticky header */}

        {/* Filters and sorting section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] h-9 bg-white dark:bg-gray-800 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="due-soon">Due Soon</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="deadline">Upcoming Deadline</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="due-soon">Due Soon</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white dark:bg-gray-800"
                >
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>My Projects</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Shared with me</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Template Type</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className={`${
                viewType === "grid"
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`}
              onClick={() => setViewType("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className={`${
                viewType === "list"
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`}
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects grid/list */}
        {isLoading ? (
          <div
            className={`grid grid-cols-1 ${
              viewType === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : ""
            } gap-5`}
          >
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <CardHeader className="p-4 pb-0">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 mb-4 w-full" />
                    <Skeleton className="h-4 mb-4 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-2 mt-4 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0 border-t mt-4">
                    <Skeleton className="h-7 w-32" />
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div
            className={`grid grid-cols-1 ${
              viewType === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : ""
            } gap-5`}
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewType={viewType}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {filterStatus !== "all"
                ? `No projects match the selected filters. Try adjusting your filter settings.`
                : "Get started by creating your first project."}
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setFilterStatus("all");
                setSortBy("recent");
              }}
            >
              {filterStatus !== "all" ? "Clear Filters" : "Create a Project"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;
