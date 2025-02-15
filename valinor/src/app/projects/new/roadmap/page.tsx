"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function ProjectRoadmapPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (stored) {
      setProjectData(JSON.parse(stored));
    } else {
      router.push("/projects/new");
    }
  }, [router]);

  useEffect(() => {
    if (projectData) {
      axios
        .post("http://localhost:8000/generate-roadmap", projectData)
        .then((response) => {
          setRoadmap(response.data.roadmap);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error generating roadmap:", error);
          setRoadmap("Error generating roadmap.");
          setLoading(false);
        });
    }
  }, [projectData]);

  const handleConfirm = () => {
    // TODO: Send projectData (and roadmap) to backend to finalize project creation
    console.log("Project confirmed:", projectData, roadmap);
    localStorage.removeItem("newProjectData");
    router.push("/"); // Redirect to dashboard or projects list
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Project Roadmap</h1>
      {loading ? (
        <p>Generating roadmap, please wait...</p>
      ) : (
        <>
          <div className="border p-4 rounded bg-white shadow mb-4">
            <pre className="whitespace-pre-wrap">{roadmap}</pre>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Confirm Project
            </button>
            <Link
              href="/projects/new/parameters"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Back
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
