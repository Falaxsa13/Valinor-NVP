"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projectResponse, setProjectResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Retrieve the saved project data from localStorage.
    const stored = localStorage.getItem("newProjectData");
    if (!stored) {
      router.push("/projects/new");
      return;
    }
    const projectData = JSON.parse(stored);
    console.log("Project data:", projectData);

    // Send the project data to your backend endpoint to create the project.
    axios
      .post("http://localhost:8000/create-project", projectData)
      .then((response) => {
        console.log("Create project response:", response.data);
        setProjectResponse(response.data);
        // Remove the project data from localStorage to prevent duplicate creation.
        localStorage.removeItem("newProjectData");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error creating project:", err);
        setError("Failed to create project. Please try again later.");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>Creating project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Project Created Successfully!</h1>
      <p className="mb-4">Project ID: {projectResponse.project_id}</p>

      {projectResponse.timeline && projectResponse.timeline.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Timeline</h2>
          <div className="bg-gray-100 p-4 rounded overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-2 border">Section</th>
                  <th className="p-2 border">Subtitle</th>
                  <th className="p-2 border">Responsible</th>
                  <th className="p-2 border">Start Date</th>
                  <th className="p-2 border">End Date</th>
                </tr>
              </thead>
              <tbody>
                {projectResponse.timeline.map((entry: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 border">{entry.section}</td>
                    <td className="p-2 border">{entry.subtitle || "—"}</td>
                    <td className="p-2 border">
                      {entry.responsible || "Unassigned"}
                    </td>
                    <td className="p-2 border">{entry.start}</td>
                    <td className="p-2 border">{entry.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Link
        href="/dashboard"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
