"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  format,
  differenceInDays,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import RoadmapComponent from "@/components/RoadmapComponent";
import KanbanBoardComponent from "@/components/KanbanBoardComponent";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import {
  ArrowLeft,
  BarChart4,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FileEdit,
  Flag,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Link2,
  List,
  MoreHorizontal,
  PanelRight,
  PanelRightClose,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Star,
  Users as UsersIcon,
  AlertTriangle,
  CheckCircle2,
  Clock4,
  HelpCircle,
  CalendarRange,
  Activity,
  Mail,
  Hourglass,
  TimerReset,
  Settings,
  Sliders,
  Bell,
} from "lucide-react";

// API
import { getProject, getProjectMetrics } from "@/api/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";

// Types
interface TimelineItem {
  id: number;
  project_id: number;
  section: string;
  subtitle: string | undefined;
  responsible_email: string;
  description: string | null;
  start: string; // Format: YYYY-MM-DD
  end: string; // Format: YYYY-MM-DD
}

interface Project {
  id: number;
  title: string;
  description: string;
  template: string;
  collaborators: string[];
  start_date: string; // Format: YYYY-MM-DD
  deadline: string; // Format: YYYY-MM-DD
  timeline: TimelineItem[];
}

interface TeamMember {
  id: number;
  email: string;
  name: string;
}

interface PhaseDistribution {
  completed: number;
  in_progress: number;
  upcoming: number;
}

interface TeamInfo {
  total_members: number;
  active_members: number;
  team_members: TeamMember[];
  roles_distribution: Record<string, number>;
}

interface PhasesInfo {
  total_phases: number;
  completed_phases: number;
  in_progress_phases: number;
  upcoming_phases: number;
  completion_percentage: number;
  phase_distribution: PhaseDistribution;
}

interface ProjectMetrics {
  team: TeamInfo;
  phases: PhasesInfo;
  last_updated: string; // Format: YYYY-MM-DD
}

// Helper Functions
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const getStatusInfo = (
  project: Project
): { label: string; color: string; icon: React.ReactNode } => {
  // Calculate based on timeline, completion, and dates
  const now = new Date();
  const deadline = new Date(project.deadline);
  const startDate = new Date(project.start_date);
  const timelineItems = project.timeline || [];

  // Check if project has started
  if (isBefore(now, startDate)) {
    return {
      label: "Not Started",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: <Clock className="w-4 h-4 mr-1.5 text-gray-500" />,
    };
  }

  // Count completed timeline items
  const totalItems = timelineItems.length;
  const completedItems = timelineItems.filter((item) =>
    isBefore(new Date(), new Date(item.end))
  ).length;

  // If past deadline
  if (isAfter(now, deadline)) {
    return totalItems === completedItems
      ? {
          label: "Completed",
          color: "bg-green-50 text-green-700 border-green-200",
          icon: <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />,
        }
      : {
          label: "Overdue",
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <AlertTriangle className="w-4 h-4 mr-1.5 text-red-600" />,
        };
  }

  // If nearing deadline (within 7 days)
  const daysToDeadline = differenceInDays(deadline, now);
  if (daysToDeadline <= 7) {
    return {
      label: "Due Soon",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <TimerReset className="w-4 h-4 mr-1.5 text-amber-600" />,
    };
  }

  // Default - in progress
  return {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Activity className="w-4 h-4 mr-1.5 text-blue-600" />,
  };
};

// Loading Skeletons
const ProjectDetailsSkeleton: React.FC = () => (
  <div className="h-screen bg-gray-50 flex flex-col">
    {/* Header Skeleton */}
    <header className="bg-white border-b px-6 py-4 h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-28" />
          <div className="h-6 w-px bg-gray-300" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </header>

    <main className="flex-1 overflow-auto px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-3" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white border rounded-lg">
          <div className="border-b p-1">
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    </main>
  </div>
);

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
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

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      const [projectData, metricsData] = await Promise.all([
        getProject(Number(id)),
        getProjectMetrics(Number(id)),
      ]);

      setProject(projectData);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const status = useMemo(() => {
    if (!project) return null;
    return getStatusInfo(project);
  }, [project]);

  const timeRemaining = useMemo(() => {
    if (!project) return null;

    const now = new Date();
    const deadline = new Date(project.deadline);

    if (isAfter(now, deadline)) {
      const daysOverdue = differenceInDays(now, deadline);
      return `${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue`;
    }

    const daysLeft = differenceInDays(deadline, now);
    return `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`;
  }, [project]);

  const projectDuration = useMemo(() => {
    if (!project) return null;

    const startDate = new Date(project.start_date);
    const deadline = new Date(project.deadline);
    return differenceInDays(deadline, startDate);
  }, [project]);

  const daysElapsed = useMemo(() => {
    if (!project) return null;

    const now = new Date();
    const startDate = new Date(project.start_date);

    if (isBefore(now, startDate)) return 0;
    return differenceInDays(now, startDate);
  }, [project]);

  const timeProgress = useMemo(() => {
    if (!projectDuration || projectDuration === 0) return 0;
    return Math.min(100, Math.round((daysElapsed! / projectDuration) * 100));
  }, [projectDuration, daysElapsed]);

  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project || !metrics) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-50 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Project Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 sm:px-6 py-4 h-16 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4 overflow-hidden">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                Back to Projects
              </span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-gray-300 flex-shrink-0" />
            <div className="flex items-center space-x-3 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {project.title}
              </h1>
              <Badge
                variant="outline"
                className={`${status?.color} whitespace-nowrap flex items-center px-2 py-1 text-xs`}
              >
                {status?.icon}
                {status?.label}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-gray-600"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-gray-600"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    {sidebarOpen ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {sidebarOpen ? "Hide" : "Show"} sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 hidden sm:flex text-gray-700"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share project</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Archive Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
            sidebarOpen ? "pr-0 lg:pr-10" : ""
          }`}
        >
          <div className="px-4 sm:px-6 py-6">
            <div className="max-w-7xl mx-auto">
              {/* Project Progress Summary */}
              <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Project Progress
                    </h2>
                    <p className="text-sm text-gray-500">
                      Started{" "}
                      {format(new Date(project.start_date), "MMM d, yyyy")} •
                      Due {format(new Date(project.deadline), "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                        timeRemaining?.includes("overdue")
                          ? "bg-red-50 text-red-700"
                          : parseInt(timeRemaining?.split(" ")[0] || "0") <= 7
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <Hourglass className="w-4 h-4 mr-1.5" />
                      {timeRemaining}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-colors"
                    >
                      <CalendarRange className="h-4 w-4 mr-1.5" />
                      View Timeline
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3">
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Overall completion
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metrics.phases.completion_percentage}%
                        </span>
                      </div>
                      <Progress
                        value={metrics.phases.completion_percentage}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600 mb-1">
                          <PieChart className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                          {metrics.phases.in_progress_phases}
                        </span>
                        <span className="text-xs text-gray-600">
                          In Progress
                        </span>
                      </div>

                      <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                        <div className="text-green-600 mb-1">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                          {metrics.phases.completed_phases}
                        </span>
                        <span className="text-xs text-gray-600">Completed</span>
                      </div>

                      <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-purple-600 mb-1">
                          <Flag className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                          {metrics.phases.upcoming_phases}
                        </span>
                        <span className="text-xs text-gray-600">Upcoming</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Time Progress
                    </h3>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-3 text-xs flex rounded-full bg-gray-200">
                        <div
                          style={{ width: `${timeProgress}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            timeProgress >= 100
                              ? "bg-red-500"
                              : timeProgress > 80
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Day {daysElapsed}</span>
                        <span>Day {projectDuration}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {format(new Date(project.start_date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">
                          {format(new Date(project.deadline), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {projectDuration} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center text-gray-500">
                      <BarChart4 className="h-4 w-4 mr-1.5" />
                      Phases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {metrics.phases.total_phases}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total phases
                        </div>
                      </div>
                      <div className="text-sm px-2 py-1 rounded-md bg-green-50 text-green-700">
                        {Math.round(
                          (metrics.phases.completed_phases /
                            metrics.phases.total_phases) *
                            100
                        )}
                        % Complete
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center text-gray-500">
                      <UsersIcon className="h-4 w-4 mr-1.5" />
                      Team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {metrics.team.active_members}
                        </div>
                        <div className="text-xs text-gray-500">
                          Active members
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {metrics.team.team_members
                          .slice(0, 3)
                          .map((member, i) => (
                            <TooltipProvider key={member.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Avatar className="h-8 w-8 border-2 border-white">
                                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>{member.name}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        {metrics.team.team_members.length > 3 && (
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback className="text-xs bg-gray-100 text-gray-800">
                              +{metrics.team.team_members.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center text-gray-500">
                      <Activity className="h-4 w-4 mr-1.5" />
                      Progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-gray-900">
                        {metrics.phases.completion_percentage}%
                      </div>
                      <div className="mt-2">
                        <Progress
                          value={metrics.phases.completion_percentage}
                          className="h-2"
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <div>Started</div>
                        <div>In Progress</div>
                        <div>Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Timeline
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="text-xl font-bold text-gray-900">
                        {differenceInDays(
                          new Date(project.deadline),
                          new Date()
                        ) > 0
                          ? `${differenceInDays(
                              new Date(project.deadline),
                              new Date()
                            )} days left`
                          : "Overdue"}
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <div className="text-gray-500">
                          {format(new Date(project.start_date), "MMM d")}
                        </div>
                        <div
                          className={
                            differenceInDays(
                              new Date(project.deadline),
                              new Date()
                            ) <= 0
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {format(new Date(project.deadline), "MMM d")}
                        </div>
                      </div>
                      <div className="mt-1 relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${timeProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full ${
                              timeProgress >= 100
                                ? "bg-red-500"
                                : timeProgress > 80
                                ? "bg-amber-500"
                                : "bg-blue-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs
                defaultValue="roadmap"
                className="bg-white border rounded-xl shadow-sm"
                onValueChange={setActiveTab}
              >
                <div className="border-b px-3">
                  <TabsList className="bg-transparent h-14">
                    <TabsTrigger
                      value="roadmap"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-14 px-4"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Roadmap
                    </TabsTrigger>
                    <TabsTrigger
                      value="kanban"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-14 px-4"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Kanban Board
                    </TabsTrigger>
                    <TabsTrigger
                      value="team"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-14 px-4"
                    >
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Team
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-14 px-4"
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="roadmap" className="m-0 p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Project Timeline
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700"
                        >
                          <List className="h-4 w-4 mr-1.5" />
                          List View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700 bg-gray-50"
                        >
                          <Sliders className="h-4 w-4 mr-1.5" />
                          Filter
                        </Button>
                      </div>
                    </div>
                    <RoadmapComponent timeline={project.timeline || []} />
                  </div>
                </TabsContent>

                <TabsContent value="kanban" className="m-0 p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Task Board
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add Task
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700"
                        >
                          <Sliders className="h-4 w-4 mr-1.5" />
                          Filter
                        </Button>
                      </div>
                    </div>
                    <KanbanBoardComponent />
                  </div>
                </TabsContent>

                <TabsContent value="team" className="m-0 p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Team Members
                      </h3>
                      <div className="flex gap-2">
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search team members..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add Member
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Member
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Role
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Tasks
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {metrics.team.team_members.map((member) => (
                              <tr key={member.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <Avatar>
                                        <AvatarFallback className="bg-blue-100 text-blue-800">
                                          {getInitials(member.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {member.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {member.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                                    {Object.keys(
                                      metrics.team.roles_distribution
                                    )[
                                      member.id %
                                        Object.keys(
                                          metrics.team.roles_distribution
                                        ).length
                                    ] || "Team Member"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {/* Random number of tasks for demo */}
                                  {Math.floor(Math.random() * 10) + 1} assigned
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                                    Active
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Mail className="h-4 w-4" />
                                    <span className="sr-only">Email</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="m-0 p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Project Analytics
                      </h3>
                      <div className="flex gap-2">
                        <Select defaultValue="last30days">
                          <SelectTrigger className="w-[180px] h-9 text-sm">
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last7days">
                              Last 7 days
                            </SelectItem>
                            <SelectItem value="last30days">
                              Last 30 days
                            </SelectItem>
                            <SelectItem value="lastQuarter">
                              Last quarter
                            </SelectItem>
                            <SelectItem value="allTime">All time</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-700"
                        >
                          <Sliders className="h-4 w-4 mr-1.5" />
                          Filters
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Phase Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-gray-500 text-sm">
                              <PieChart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                              Chart visualization would appear here
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Task Completion Trend
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-gray-500 text-sm">
                              <LineChart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                              Chart visualization would appear here
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="hidden lg:block w-80 border-l bg-white overflow-y-auto flex-shrink-0 h-[calc(100vh-4rem)]"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-6">
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Project Details
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {project.description || "No description provided."}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Template:</span>
                      <span className="font-medium text-gray-900">
                        {project.template}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(project.start_date), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="font-medium text-gray-900">
                        {format(parseISO(metrics.last_updated), "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Team Members
                  </h3>
                  <div className="space-y-3">
                    {metrics.team.team_members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full mt-2 text-sm"
                      size="sm"
                    >
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add Team Member
                    </Button>
                  </div>
                </div>

                <div className="border-b pb-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-3">
                    {project.timeline
                      .filter((item) => {
                        const endDate = new Date(item.end);
                        const now = new Date();
                        return (
                          isAfter(endDate, now) &&
                          differenceInDays(endDate, now) <= 14
                        );
                      })
                      .sort(
                        (a, b) =>
                          new Date(a.end).getTime() - new Date(b.end).getTime()
                      )
                      .slice(0, 3)
                      .map((item) => (
                        <div key={item.id} className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                differenceInDays(
                                  new Date(item.end),
                                  new Date()
                                ) <= 3
                                  ? "bg-red-500"
                                  : differenceInDays(
                                      new Date(item.end),
                                      new Date()
                                    ) <= 7
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                            ></div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-800">
                              {item.section}
                            </div>
                            <div className="text-xs text-gray-500">
                              Due {format(new Date(item.end), "MMM d")} •
                              {differenceInDays(new Date(item.end), new Date())}{" "}
                              days left
                            </div>
                          </div>
                        </div>
                      ))}

                    {project.timeline.filter((item) => {
                      const endDate = new Date(item.end);
                      const now = new Date();
                      return (
                        isAfter(endDate, now) &&
                        differenceInDays(endDate, now) <= 14
                      );
                    }).length === 0 && (
                      <div className="text-sm text-gray-500 italic">
                        No upcoming deadlines
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full mt-1 text-sm text-blue-600"
                      size="sm"
                    >
                      View All Deadlines
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Quick Links
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-auto py-2.5"
                      size="sm"
                    >
                      <FileEdit className="h-4 w-4 mr-2 text-gray-500" />
                      Edit Project
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-auto py-2.5"
                      size="sm"
                    >
                      <Share2 className="h-4 w-4 mr-2 text-gray-500" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-auto py-2.5"
                      size="sm"
                    >
                      <Globe className="h-4 w-4 mr-2 text-gray-500" />
                      Project Site
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-auto py-2.5"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2 text-gray-500" />
                      Settings
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-auto py-2.5 col-span-2"
                      size="sm"
                    >
                      <HelpCircle className="h-4 w-4 mr-2 text-gray-500" />
                      Help & Support
                    </Button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
