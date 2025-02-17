"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Check,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  ChevronRight,
  Circle,
} from "lucide-react";
import { createProject, generateTimeline } from "@/api/api";

interface TimelineEntry {
  section: string;
  subtitle?: string;
  responsible?: string;
  start: string;
  end: string;
}

interface ProjectData {
  title: string;
  description?: string;
  templateId: number;
  collaborators: string[];
  startDate: string;
  deadline: string;
  assignments: Record<string, string>;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function calculateProgress(start: string, end: string) {
  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (today < startDate) return 0;
  if (today > endDate) return 100;

  const total = endDate.getTime() - startDate.getTime();
  const current = today.getTime() - startDate.getTime();
  return Math.round((current / total) * 100);
}

function TimelineItem({
  entry,
  index,
  isLast,
}: {
  entry: TimelineEntry;
  index: number;
  isLast: boolean;
}) {
  const progress = calculateProgress(entry.start, entry.end);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-start mb-8 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-4 top-8 w-0.5 h-full -ml-px bg-gray-200" />
        )}

        {/* Timeline dot */}
        <div
          className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
            progress === 100
              ? "bg-green-100"
              : progress > 0
              ? "bg-blue-100"
              : "bg-gray-100"
          } transition-colors duration-200`}
        >
          {progress === 100 ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Circle
              className={`w-4 h-4 ${
                progress > 0 ? "text-blue-600" : "text-gray-400"
              }`}
            />
          )}
        </div>

        {/* Content */}
        <div className="ml-4 flex-1">
          <Card
            className={`
            transition-all duration-200 cursor-pointer
            ${isHovered ? "transform -translate-y-1 shadow-lg" : "shadow"}
          `}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {entry.section}
                  </h3>
                  {entry.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.subtitle}
                    </p>
                  )}
                </div>
                <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                  Phase {index + 1}
                </span>
              </div>

              <div className="mt-4">
                <Progress value={progress} className="h-2 w-full bg-gray-100" />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span>{formatDate(entry.start)}</span>
                  <span>{progress}% Complete</span>
                  <span>{formatDate(entry.end)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{entry.responsible || "Unassigned"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (!stored) {
      router.push("/projects/new");
      return;
    }

    const parsedData = JSON.parse(stored);
    setProjectData(parsedData);

    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    generateTimeline(parsedData)
      .then((timelineData) => {
        setTimeline(timelineData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error generating timeline:", err);
        setError("Failed to generate timeline. Please try again.");
        setLoading(false);
      });
  }, [router]);

  const handleCreateProject = () => {
    if (!projectData || !timeline) return;

    setCreatingProject(true);

    createProject({ ...projectData, timeline })
      .then((response) => {
        localStorage.removeItem("newProjectData");
        router.push(`/projects/${response.project_id}`);
      })
      .catch((err) => {
        console.error("Error creating project:", err);
        setError("Failed to create project. Please try again.");
        setCreatingProject(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-medium text-gray-900">
              Generating Timeline...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Progress value={50} className="h-2 w-full" />
            <p className="mt-4 text-gray-600">This may take a few seconds.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Link
              href="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Review & Create Project
        </h1>
        <p className="mt-2 text-gray-600 text-center">
          Here’s your auto-generated timeline. Review and proceed.
        </p>

        {timeline && timeline.length > 0 && (
          <div className="mt-8">
            {timeline.map((entry, index) => (
              <div key={index} className="mb-6 bg-white p-4 shadow rounded-lg">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{entry.section}</h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(entry.start)} → {formatDate(entry.end)}
                  </span>
                </div>
                {entry.subtitle && (
                  <p className="text-gray-600 text-sm mt-1">{entry.subtitle}</p>
                )}
                <p className="mt-2 text-sm text-gray-700">
                  <Users className="w-4 h-4 inline-block mr-1 text-gray-500" />
                  {entry.responsible || "Unassigned"}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={handleCreateProject}
            disabled={creatingProject}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            {creatingProject ? "Creating..." : "Confirm & Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
