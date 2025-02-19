"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject, generateTimeline } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { parse } from "path";

interface ProjectData {
  title: string;
  description?: string;
  templateId: number;
  collaborators: string[];
  startDate: string;
  deadline: string;
  assignments: Record<string, string>;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (!stored) {
      router.push("/projects/new");
      return;
    }

    const parsedData: ProjectData = JSON.parse(stored);

    const formattedData = {
      title: parsedData.title,
      description: parsedData.description,
      collaborators: parsedData.collaborators,
      start_date: new Date(parsedData.startDate),
      deadline: new Date(parsedData.deadline),
      assignments: parsedData.assignments,
      template_id: parsedData.templateId,
    };

    generateTimeline(parsedData)
      .then((timelineData) => {
        return createProject({ ...formattedData, timeline: timelineData });
      })
      .then(() => {
        localStorage.removeItem("newProjectData");
        setSuccess(true);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError("Failed to create project. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-medium text-gray-900">
              Setting up your project...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Progress value={50} className="h-2 w-full" />
            <p className="mt-4 text-gray-600">Please wait a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-none shadow-lg max-w-md">
          <CardHeader className="text-center">
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent className="text-center">
            <button
              onClick={() => router.push("/projects/new")}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="border-none shadow-lg max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
            <CardTitle className="text-2xl font-medium text-gray-900 mt-2">
              Project Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Congratulations! Your project has been successfully created.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
