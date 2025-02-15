"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectParametersPage() {
  const router = useRouter();
  const [collaborators, setCollaborators] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (stored) {
      setProjectData(JSON.parse(stored));
    } else {
      router.push("/projects/new");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...projectData,
      collaborators: collaborators
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c),
      deadline,
    };
    localStorage.setItem("newProjectData", JSON.stringify(updatedData));
    router.push("/projects/new/assignment");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Define Project Parameters</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="collaborators"
            className="block text-sm font-medium mb-1"
          >
            Collaborators (comma-separated emails)
          </label>
          <input
            id="collaborators"
            type="text"
            value={collaborators}
            onChange={(e) => setCollaborators(e.target.value)}
            placeholder="e.g., john@example.com, jane@example.com"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium mb-1">
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex space-x-4">
          {/* Changed from Link to button so that handleSubmit is triggered */}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
          <Link
            href="/projects/new"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
