"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AssignmentPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("newProjectData");
    if (stored) {
      const data = JSON.parse(stored);
      console.log("Loaded projectData:", data);
      setProjectData(data);
      // Check for template and sections within data.template.structure
      if (
        data.template &&
        data.template.structure &&
        data.template.structure.sections &&
        Array.isArray(data.template.structure.sections)
      ) {
        const initialAssignments: Record<string, string> = {};
        data.template.structure.sections.forEach((section: any) => {
          initialAssignments[section.title] = ""; // Default to unassigned
        });
        setAssignments(initialAssignments);
      } else {
        console.warn(
          "No template sections found in projectData",
          data.template
        );
      }
    } else {
      router.push("/projects/new");
    }
  }, [router]);

  const handleAssignmentChange = (section: string, collaborator: string) => {
    setAssignments((prev) => ({ ...prev, [section]: collaborator }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...projectData,
      assignments,
    };
    localStorage.setItem("newProjectData", JSON.stringify(updatedData));
    router.push("/projects/new/roadmap");
  };

  if (!projectData) {
    return <p>Loading...</p>;
  }

  // Ensure collaborators is an array
  const collaborators: string[] = projectData.collaborators || [];
  if (collaborators.length === 0) {
    console.warn("No collaborators found in projectData");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Assign Components to Collaborators
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {projectData.template &&
        projectData.template.structure &&
        projectData.template.structure.sections ? (
          <div className="space-y-4">
            {projectData.template.structure.sections.map(
              (section: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-1">
                    {section.title}
                  </label>
                  <select
                    value={assignments[section.title]}
                    onChange={(e) =>
                      handleAssignmentChange(section.title, e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  >
                    <option value="">Unassigned</option>
                    {collaborators.map((collab: string, idx: number) => (
                      <option key={idx} value={collab}>
                        {collab}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-600">No template sections available.</p>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
          <Link
            href="/projects/new/parameters"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
